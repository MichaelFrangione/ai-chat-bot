import type { ToolFn } from "../../types";
import { z } from "zod";
import { openai } from "../ai";
import { queryMovies } from "../rag/query";
import type { MovieMetadata } from "../rag/types";

export const movieSearchToolDefinition = {
    name: "movie_search",
    parameters: z.object({
        query: z.string().describe(
            "Search query for movies. Use specific terms like 'alien invasion', 'space exploration', 'action thriller', 'romantic comedy', 'highly rated sci-fi', 'movies from 1990s', etc. Be descriptive and specific."
        ),
        genre: z.string().nullable().describe('Filter movies by genre (e.g., "Action", "Comedy", "Sci-Fi"). Only use when user specifically mentions a genre by name.'),
        director: z.string().nullable().describe('Filter movies by director name (e.g., "Christopher Nolan", "Steven Spielberg"). Only use when user specifically mentions a director by name.'),
        limit: z.number().nullable().describe('Number of movies to return. Use 1 for single recommendations (like "the best", "ultimate", "top pick"). Use null or higher numbers for multiple recommendations.'),
    }),
    description: `ALWAYS use this tool when users ask about movies, want movie recommendations, suggestions, or ask to find specific movies. This tool searches a database of movies with metadata including title, year, genre, director, actors, rating, votes, revenue, metascore, and descriptions. Use for ANY movie-related query. 

FILTERING GUIDELINES:
- Use director filter when user mentions a specific director by name
- Use genre filter when user mentions a specific genre by name  
- Use limit=1 when user asks for a single recommendation ("the best", "ultimate", "top pick", "recommend me one movie")
- Use limit=null or higher when user asks for multiple recommendations ("recommendations", "suggestions", "list of movies")
- The vector search is very effective at finding relevant movies based on descriptions and themes`,
};

type Args = z.infer<typeof movieSearchToolDefinition.parameters>;

export const movieSearch: ToolFn<Args, string> = async ({ toolArgs, userMessage }: { toolArgs: Args; userMessage: string; }) => {

    const { query, genre, director, limit } = toolArgs;

    const filters = {
        ...(genre && genre !== null && { genre }),
        ...(director && director !== null && { director }),
    };

    // Determine how many results to return
    const actualLimit = limit ?? 5; // Default to 5 if not specified
    const isSingleRecommendation = actualLimit === 1;

    console.log('filters', filters);
    console.log('limit', actualLimit, 'isSingle', isSingleRecommendation);

    let results;

    try {
        results = await queryMovies({
            query: toolArgs.query,
            filters,
            topK: Math.max(actualLimit, 3) // Get at least 3 results for analysis even if we only want 1
        });
    } catch (e) {
        console.error(e);
        return `Error: Could not query the db to get movies`;
    }

    const formattedResults = results.map((result: any) => {
        const metadata = result.metadata as MovieMetadata;
        return { ...metadata };
    });

    // Return structured format for movie recommendations
    const structuredResponse = {
        type: 'movie_recommendations',
        data: {
            recommendations: formattedResults.slice(0, actualLimit), // Use the specified limit
            query: query,
            genre: genre
        },
        metadata: {
            title: isSingleRecommendation ? 'Movie Recommendation' : 'Movie Recommendations',
            description: isSingleRecommendation
                ? `Found the perfect movie for "${query}"`
                : `Found ${formattedResults.length} movie recommendations for "${query}"`
        },
        contextualMessage: await generateContextualMessage(formattedResults, query, genre, director, isSingleRecommendation),
        aiChosenMovie: isSingleRecommendation ? formattedResults[0] : await getAiChosenMovie(formattedResults, query, genre, director)
    };

    return JSON.stringify(structuredResponse, null, 2);
};

async function getAiChosenMovie(movies: any[], query: string, genre?: string | null, director?: string | null): Promise<any> {
    if (movies.length === 0) {
        return null;
    }

    try {
        const choicePrompt = `You are a movie recommendation expert. Analyze these movie search results and pick the BEST recommendation for the user's request.

User's search: "${query}"
Genre filter: ${genre || 'None'}
Director filter: ${director || 'None'}

Available movies:
${movies.map((movie, index) => `${index + 1}. ${movie.title} (${movie.year}) - ${movie.description} - Genre: ${movie.genre} - Rating: ${movie.rating}/10`).join('\n')}

Your task:
1. Analyze which movie would be the BEST match for the user's specific request
2. Consider factors like: how well it matches the search terms, genre appropriateness, rating quality, year relevance, and overall appeal
3. Pick the movie that would genuinely be the best recommendation (not just the first one)
4. Respond with ONLY the movie title in quotes, nothing else

Example response: "The Matrix"`;

        const choiceResponse = await openai.chat.completions.create({
            model: "gpt-5-nano",
            messages: [
                { role: "system", content: "You are a movie recommendation expert. Pick the best movie from the list and respond with only the title in quotes." },
                { role: "user", content: choicePrompt }
            ],
            temperature: 0.3
        });

        const chosenTitle = choiceResponse.choices[0]?.message?.content?.trim().replace(/"/g, '');

        if (!chosenTitle) {
            return movies[0]; // Fallback to first movie if no title returned
        }

        // Find the chosen movie in the results
        const chosenMovie = movies.find(movie =>
            movie.title.toLowerCase() === chosenTitle.toLowerCase() ||
            movie.title.toLowerCase().includes(chosenTitle.toLowerCase()) ||
            chosenTitle.toLowerCase().includes(movie.title.toLowerCase())
        );

        return chosenMovie || movies[0]; // Fallback to first movie if not found
    } catch (error) {
        console.error('Error choosing movie:', error);
        return movies[0]; // Fallback to first movie
    }
}

async function generateContextualMessage(movies: any[], query: string, genre?: string | null, director?: string | null, isSingleRecommendation: boolean = false): Promise<string> {
    if (movies.length === 0) {
        return `I couldn't find any movies matching your criteria. Try adjusting your search terms or filters.`;
    }

    try {
        let contextualPrompt;

        if (isSingleRecommendation) {
            // For single recommendations, focus on why this ONE movie is perfect
            contextualPrompt = `You are a movie recommendation expert. The user asked for a SINGLE movie recommendation. Analyze these search results and pick the ONE BEST movie for their request.

User's search: "${query}"
Genre filter: ${genre || 'None'}
Director filter: ${director || 'None'}

Available movies to choose from:
${movies.map((movie, index) => `${index + 1}. ${movie.title} (${movie.year}) - ${movie.description} - Genre: ${movie.genre} - Rating: ${movie.rating}/10`).join('\n')}

Your task:
1. Pick the ONE movie that best matches the user's request
2. Write a focused, enthusiastic message about WHY this specific movie is perfect for them
3. Be confident and decisive - you're recommending THE ultimate choice
4. Explain what makes this movie special and why it stands out above the others

Make it sound like you found THE perfect movie for their request. Be specific about why this movie is ideal.`;
        } else {
            // For multiple recommendations, provide analysis of the top pick
            contextualPrompt = `You are a movie recommendation expert. Analyze these movie search results and provide a recommendation with context.

User's search: "${query}"
Genre filter: ${genre || 'None'}
Director filter: ${director || 'None'}

Available movies:
${movies.map((movie, index) => `${index + 1}. ${movie.title} (${movie.year}) - ${movie.description} - Genre: ${movie.genre} - Rating: ${movie.rating}/10`).join('\n')}

Your task:
1. Analyze which movie would be the BEST match for the user's specific request
2. Consider factors like: how well it matches the search terms, genre appropriateness, rating quality, year relevance, and overall appeal
3. Pick the movie that would genuinely be the best recommendation (not just the first one)
4. Write a natural, conversational message that introduces your chosen movie and explains WHY it's the perfect pick for their request

Make it sound like you actually analyzed all the options and picked the best one. Be enthusiastic and specific about why this movie is ideal for their request.`;
        }

        const contextualResponse = await openai.chat.completions.create({
            model: "gpt-5-nano",
            messages: [
                { role: "system", content: "You are a helpful movie recommendation assistant. Analyze multiple options and pick the best recommendation based on the user's specific needs." },
                { role: "user", content: contextualPrompt }
            ],
            temperature: 1
        });

        const contextualMessage = contextualResponse.choices[0]?.message?.content?.trim();
        return contextualMessage || "";
    } catch (error) {
        console.error('Error generating contextual message:', error);
        return "";
    }
}