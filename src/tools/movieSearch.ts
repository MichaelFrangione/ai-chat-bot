import type { ToolFn } from "../../types";
import { z } from "zod";
import { openai } from "../ai";
import { queryMovies } from "../rag/query";
import type { MovieMetadata } from "../rag/types";
import { styleWithPersona } from "../lib/persona-styler";
import { PersonalityKey } from "../constants/personalities";

export const movieSearchToolDefinition = {
    name: "movie_search",
    parameters: z.object({
        query: z.string().describe(
            "Search query for movies. Use specific terms like 'alien invasion', 'space exploration', 'action thriller', 'romantic comedy', 'highly rated sci-fi', 'movies from 1990s', etc. Be descriptive and specific."
        ),
        genre: z.string().nullable().describe('Filter movies by genre (e.g., "Action", "Comedy", "Sci-Fi"). Only use when user specifically mentions a genre by name.'),
        director: z.string().nullable().describe('Filter movies by director name (e.g., "Christopher Nolan", "Steven Spielberg"). Only use when user specifically mentions a director by name.'),
        year: z.number().nullable().describe('Filter movies by year (e.g., 1995, 2000). Only use when user specifically mentions a year or decade (e.g., "90s" = 1990s, "2000s" = 2000s).'),
        limit: z.number().nullable().describe('Number of movies to return. Use 1 for single recommendations (like "the best", "ultimate", "top pick"). Use null or higher numbers for multiple recommendations.'),
    }),
    description: `ALWAYS use this tool when users ask about movies, want movie recommendations, suggestions, or ask to find specific movies. This tool searches a database of movies with metadata including title, year, genre, director, actors, rating, votes, revenue, metascore, and descriptions. Use for ANY movie-related query. 

FILTERING GUIDELINES:
- Use director filter when user mentions a specific director by name
- Use genre filter when user mentions a specific genre by name  
- Use year filter when user mentions a specific year (e.g., 1995) or decade (e.g., "90s" = 1990s, "2000s" = 2000s)
- Use limit=1 when user asks for a single recommendation ("the best", "ultimate", "top pick", "recommend me one movie")
- Use limit=null or higher when user asks for multiple recommendations ("recommendations", "suggestions", "list of movies")
- The vector search is very effective at finding relevant movies based on descriptions and themes`,
};

type Args = z.infer<typeof movieSearchToolDefinition.parameters>;

export const movieSearch: ToolFn<Args, string> = async ({ toolArgs, userMessage, personality }: { toolArgs: Args; userMessage: string; personality?: PersonalityKey; }) => {

    const { query, genre, director, year, limit } = toolArgs;

    const filters = {
        ...(genre && genre !== null && { genre }),
        ...(director && director !== null && { director }),
        ...(year && year !== null && { year }),
    };

    // Determine how many results to return
    const actualLimit = limit ?? 5; // Default to 5 if not specified
    const isSingleRecommendation = actualLimit === 1;

    console.log('filters', filters);
    console.log('limit', actualLimit, 'isSingle', isSingleRecommendation);
    console.log('toolArgs.limit:', limit);
    console.log('personality (movieSearch):', personality);

    let results;

    try {
        results = await queryMovies({
            query: toolArgs.query,
            filters,
            topK: Math.max(actualLimit, 3)
        });
    } catch (e) {
        console.error('Movie search error:', e);
        return JSON.stringify({
            type: 'movie_recommendations',
            metadata: {
                title: 'Movie Search Error',
                description: 'Unable to search movies at this time'
            },
            data: {
                recommendations: []
            },
            contextualMessage: 'Sorry, I encountered an error while searching for movies. Please try again later.'
        });
    }

    const formattedResults = results.map((result: any) => {
        const metadata = result.metadata as MovieMetadata;
        return { ...metadata };
    });

    // Handle empty results
    if (formattedResults.length === 0) {
        return JSON.stringify({
            type: 'movie_recommendations',
            metadata: {
                title: 'No Movies Found',
                description: 'No movies match your search criteria'
            },
            data: {
                recommendations: [],
                query: query,
                genre: genre,
                year: year,
                director: director
            },
            contextualMessage: `Sorry, I couldn't find any movies matching your search for "${query}". Note: My movie database contains films from 2006 onwards. If you're looking for older movies, try searching for recent films with similar themes or genres.`
        });
    }

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
        contextualMessage: await generateContextualMessage(formattedResults, query, genre, director, isSingleRecommendation, personality),
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
            temperature: 1
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

async function generateContextualMessage(movies: any[], query: string, genre?: string | null, director?: string | null, isSingleRecommendation: boolean = false, personality?: PersonalityKey, chosenMovie?: any): Promise<string> {
    if (movies.length === 0) {
        return `I couldn't find any movies matching your criteria. Try adjusting your search terms or filters.`;
    }

    try {
        let contextualPrompt;

        if (isSingleRecommendation) {
            // For single recommendations, reference the specific chosen movie
            const chosenMovieInfo = chosenMovie ? `\n\nIMPORTANT: You must specifically recommend "${chosenMovie.title}" (${chosenMovie.year}) as your top pick.` : '';

            contextualPrompt = `You are a movie recommendation expert. The user asked for a SINGLE movie recommendation.

User's search: "${query}"
Genre filter: ${genre || 'None'}
Director filter: ${director || 'None'}

Available movies:
${movies.map((movie, index) => `${index + 1}. ${movie.title} (${movie.year}) - ${movie.description} - Genre: ${movie.genre} - Rating: ${movie.rating}/10`).join('\n')}${chosenMovieInfo}

Write a SHORT, enthusiastic message (1-2 sentences max) about why this specific movie is perfect for their request. Be confident and specific but concise.`;
        } else {
            // For multiple recommendations, keep it brief
            contextualPrompt = `You are a movie recommendation expert. Analyze these movie search results.

User's search: "${query}"
Genre filter: ${genre || 'None'}
Director filter: ${director || 'None'}

Available movies:
${movies.map((movie, index) => `${index + 1}. ${movie.title} (${movie.year}) - ${movie.description} - Genre: ${movie.genre} - Rating: ${movie.rating}/10`).join('\n')}

Write a SHORT message (1-2 sentences max) introducing your top pick and why it's perfect for their request. Be enthusiastic but concise.`;
        }

        const contextualResponse = await openai.chat.completions.create({
            model: "gpt-5-nano",
            messages: [
                { role: "system", content: "You are a helpful movie recommendation assistant. Keep responses short and to the point." },
                { role: "user", content: contextualPrompt }
            ],
            temperature: 1
        });

        const contextualMessage = contextualResponse.choices[0]?.message?.content?.trim();

        // Style the message with personality if one is selected
        if (personality && personality !== 'assistant' && contextualMessage) {
            return await styleWithPersona(contextualMessage, personality, 'movie recommendation');
        }

        return contextualMessage || "";
    } catch (error) {
        console.error('Error generating contextual message:', error);
        return "";
    }
}

// AI SDK tool - proper format with inputSchema
export const movieSearchTool = {
    description: `ALWAYS use this tool when users ask about movies, want movie recommendations, suggestions, or ask to find specific movies. This tool searches a database of movies with metadata including title, year, genre, director, actors, rating, votes, revenue, metascore, and descriptions. Use for ANY movie-related query. 

FILTERING GUIDELINES:
- Use director filter when user mentions a specific director by name
- Use genre filter when user mentions a specific genre by name  
- Use year filter when user mentions a specific year (e.g., 1995) or decade (e.g., "90s" = 1990s, "2000s" = 2000s)
- Use limit=1 when user asks for a single recommendation ("the best", "ultimate", "top pick", "recommend me one movie")
- Use limit=null or higher when user asks for multiple recommendations ("recommendations", "suggestions", "list of movies")
- The vector search is very effective at finding relevant movies based on descriptions and themes`,
    inputSchema: z.object({
        query: z.string().describe("Search query for movies. Use specific terms like 'alien invasion', 'space exploration', 'action thriller', 'romantic comedy', 'highly rated sci-fi', 'movies from 1990s', etc. Be descriptive and specific."),
        genre: z.string().nullable().describe('Filter movies by genre (e.g., "Action", "Comedy", "Sci-Fi"). Only use when user specifically mentions a genre by name.'),
        director: z.string().nullable().describe('Filter movies by director name (e.g., "Christopher Nolan", "Steven Spielberg"). Only use when user specifically mentions a director by name.'),
        year: z.number().nullable().describe('Filter movies by year (e.g., 1995, 2000). Only use when user specifically mentions a year or decade (e.g., "90s" = 1990s, "2000s" = 2000s).'),
        limit: z.number().nullable().describe('Number of movies to return. Use 1 for single recommendations (like "the best", "ultimate", "top pick"). Use null or higher numbers for multiple recommendations.'),
    }),
    execute: async ({ query, genre, director, year, limit }: { query: string; genre: string | null; director: string | null; year: number | null; limit: number | null; }, context: any) => {
        console.log('movieSearch context:', context);
        // TODO: Personality not available in AI SDK tools context
        const personality = undefined; // Temporarily disabled until we find a way to pass personality to tools

        const filters = {
            ...(genre && genre !== null && { genre }),
            ...(director && director !== null && { director }),
            ...(year && year !== null && { year }),
        };

        // Determine how many results to return
        const actualLimit = limit ?? 5; // Default to 5 if not specified
        const isSingleRecommendation = actualLimit === 1;

        console.log('filters', filters);
        console.log('limit', actualLimit, 'isSingle', isSingleRecommendation);
        console.log('toolArgs.limit:', limit);
        console.log('personality (movieSearch):', personality);

        let results;

        try {
            results = await queryMovies({
                query: query,
                filters,
                topK: Math.max(actualLimit, 3)
            });
        } catch (e) {
            console.error('Movie search error:', e);
            return JSON.stringify({
                type: 'movie_recommendations',
                metadata: {
                    title: 'Movie Search Error',
                    description: 'Unable to search movies at this time'
                },
                data: {
                    recommendations: []
                },
                contextualMessage: 'Sorry, I encountered an error while searching for movies. Please try again later.'
            });
        }

        const formattedResults = results.map((result: any) => {
            const metadata = result.metadata as MovieMetadata;
            return { ...metadata };
        });

        // Handle empty results
        if (formattedResults.length === 0) {
            return JSON.stringify({
                type: 'movie_recommendations',
                metadata: {
                    title: 'No Movies Found',
                    description: 'No movies match your search criteria'
                },
                data: {
                    recommendations: [],
                    query: query,
                    genre: genre,
                    year: year,
                    director: director
                },
                contextualMessage: `Sorry, I couldn't find any movies matching your search for "${query}". Note: My movie database contains films from 2006 onwards. If you're looking for older movies, try searching for recent films with similar themes or genres.`
            });
        }

        // First, determine the AI-chosen movie (use AI selection for both single and multiple recommendations)
        const aiChosenMovie = await getAiChosenMovie(formattedResults, query, genre, director);

        // Then generate contextual message that specifically refers to the chosen movie
        const contextualMessage = await generateContextualMessage(formattedResults, query, genre, director, isSingleRecommendation, personality, aiChosenMovie);

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
            contextualMessage: contextualMessage,
            aiChosenMovie: aiChosenMovie
        };

        return JSON.stringify(structuredResponse, null, 2);
    }
};