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
        genre: z.string().nullable().describe('Filter movies by genre (e.g., "Action", "Comedy", "Sci-Fi"). Only use when user specifically mentions a genre.'),
        director: z.string().nullable().describe('Filter movies by director name (e.g., "Christopher Nolan", "Steven Spielberg"). Only use when user specifically mentions a director by name.'),
    }),
    description: `ALWAYS use this tool when users ask about movies, want movie recommendations, suggestions, or ask to find specific movies. This tool searches a database of movies with metadata including title, year, genre, director, actors, rating, votes, revenue, metascore, and descriptions. Use for ANY movie-related query. IMPORTANT: When users mention specific directors by name (like "Christopher Nolan" or "Steven Spielberg"), use the director filter. When users mention genres (like "action movies" or "comedy"), use the genre filter.`,
};

type Args = z.infer<typeof movieSearchToolDefinition.parameters>;

export const movieSearch: ToolFn<Args, string> = async ({ toolArgs, userMessage }: { toolArgs: Args; userMessage: string; }) => {

    const { query, genre, director } = toolArgs;

    const filters = {
        ...(genre && genre !== null && { genre }),
        ...(director && director !== null && { director }),
    };


    console.log('filters', filters);

    let results;

    try {
        results = await queryMovies({
            query: toolArgs.query,
            filters,
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
            recommendations: formattedResults.slice(0, 5), // Limit to top 5 recommendations
            query: query,
            genre: genre
        },
        metadata: {
            title: 'Movie Recommendations',
            description: `Found ${formattedResults.length} movie recommendations for "${query}"`
        },
        contextualMessage: await generateContextualMessage(formattedResults, query, genre, director)
    };

    return JSON.stringify(structuredResponse, null, 2);
};

async function generateContextualMessage(movies: any[], query: string, genre?: string | null, director?: string | null): Promise<string> {
    if (movies.length === 0) {
        return `I couldn't find any movies matching your criteria. Try adjusting your search terms or filters.`;
    }

    const topMovie = movies[0];

    try {
        const contextualPrompt = `Generate a contextual message for movie recommendations. 

User's search: "${query}"
Genre filter: ${genre || 'None'}
Director filter: ${director || 'None'}
Number of recommendations found: ${movies.length}
Top pick: ${topMovie.title}

Generate a natural, conversational message that introduces the top pick, and explain why this movie was chosen as the top recommendation based on its qualities and how it matches the user's search. Make it sound natural and engaging.`;

        const contextualResponse = await openai.chat.completions.create({
            model: "gpt-5-nano",
            messages: [
                { role: "system", content: "You are a helpful movie recommendation assistant. Generate natural, conversational messages for movie recommendations." },
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