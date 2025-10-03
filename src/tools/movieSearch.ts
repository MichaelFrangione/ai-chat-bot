import type { ToolFn } from "../types";
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
        return { ...metadata, description: result.data };
    });

    return JSON.stringify(formattedResults, null, 2);
};