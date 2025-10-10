import type { StructuredOutput, MovieRecommendationsOutput, ImageGenerationOutput, RedditPostsOutput, YoutubeTranscriberOutput } from '../types/structured';

export function parseAssistantResponse(content: string): StructuredOutput | null {
    // Try to parse JSON responses from assistant
    try {
        const jsonResponse = JSON.parse(content);

        // Check if this is a structured output format
        if (jsonResponse.type === 'reddit_posts' && jsonResponse.data && jsonResponse.data.posts) {
            return jsonResponse as RedditPostsOutput;
        }

        if (jsonResponse.type === 'movie_recommendations' && jsonResponse.data && jsonResponse.data.recommendations) {
            return jsonResponse as MovieRecommendationsOutput;
        }

        if (jsonResponse.type === 'image_generation' && jsonResponse.data && jsonResponse.data.url) {
            return jsonResponse as ImageGenerationOutput;
        }

    } catch (error) {
        // Not JSON, continue with normal parsing
    }

    // Try to parse natural language movie recommendations
    return parseMovieRecommendations(content);
}

export function parseToolResponse(toolName: string, response: string): StructuredOutput | null {
    if (toolName === 'movie_search') {
        return parseMovieSearchResponse(response);
    }
    if (toolName === 'generate_image') {
        return parseImageGenerationResponse(response);
    }
    if (toolName === 'reddit') {
        return parseRedditResponse(response);
    }
    // youtubeTranscriber now returns plain text, not structured output
    return null;
}

function parseMovieRecommendations(content: string): MovieRecommendationsOutput | null {
    // Look for patterns like "- Movie Title (Year) — description" or "- Movie Title (Year) – description"
    const moviePatterns = [
        /- ([^(]+) \((\d{4})\) — ([^;]+)/g,  // em dash
        /- ([^(]+) \((\d{4})\) – ([^;]+)/g,  // en dash
        /- ([^(]+) \((\d{4})\) - ([^;]+)/g   // regular dash
    ];

    const recommendations: any[] = [];

    console.log('Parsing movie recommendations from:', content.substring(0, 300) + '...');

    for (const pattern of moviePatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            console.log('Found match:', match);
            const [, title, year, description] = match;
            const trimmedTitle = title.trim();
            const trimmedDescription = description.trim();

            recommendations.push({
                title: trimmedTitle,
                year: parseInt(year),
                description: trimmedDescription,
                tags: extractTags(trimmedDescription),
                rating: extractRating(trimmedDescription),
                metascore: extractMetascore(trimmedDescription),
                director: extractDirector(trimmedDescription)
            });
        }

        // If we found recommendations with this pattern, break
        if (recommendations.length > 0) {
            break;
        }
    }

    console.log('Total recommendations found:', recommendations.length);

    if (recommendations.length === 0) {
        return null;
    }

    // Extract genre from content if mentioned
    const genreMatch = content.match(/(?:horror|comedy|action|drama|sci-fi|thriller|romance)/i);
    const genre = genreMatch ? genreMatch[0].toLowerCase() : undefined;

    return {
        type: 'movie_recommendations',
        data: {
            recommendations,
            genre
        },
        metadata: {
            title: 'Movie Recommendations',
            description: `Found ${recommendations.length} movie recommendations`
        }
    };
}

function extractTags(description: string): string[] {
    const tags: string[] = [];

    // Common movie tags to look for
    const tagPatterns = [
        /tense/i, /creature-feature/i, /supernatural/i, /psychological/i,
        /jump scare/i, /atmospheric/i, /brutal/i, /intense/i, /suspense/i,
        /claustrophobic/i, /ensemble/i, /surprise ending/i, /effective/i,
        /lean/i, /simple setting/i, /extreme/i, /impactful/i
    ];

    tagPatterns.forEach(pattern => {
        const match = description.match(pattern);
        if (match) {
            tags.push(match[0].toLowerCase());
        }
    });

    return tags;
}

function extractRating(description: string): number | undefined {
    // Look for patterns like "rating: 7.5", "7.5/10", "IMDb: 7.5"
    const ratingPatterns = [
        /rating[:\s]+([0-9.]+)/i,
        /([0-9.]+)\/10/i,
        /imdb[:\s]+([0-9.]+)/i,
        /([0-9.]+)\s*stars?/i
    ];

    for (const pattern of ratingPatterns) {
        const match = description.match(pattern);
        if (match) {
            const rating = parseFloat(match[1]);
            if (rating >= 0 && rating <= 10) {
                return rating;
            }
        }
    }

    return undefined;
}

function extractMetascore(description: string): number | undefined {
    // Look for patterns like "metascore: 75", "Metacritic: 75", "75/100"
    const metascorePatterns = [
        /metascore[:\s]+(\d+)/i,
        /metacritic[:\s]+(\d+)/i,
        /(\d+)\/100/i
    ];

    for (const pattern of metascorePatterns) {
        const match = description.match(pattern);
        if (match) {
            const metascore = parseInt(match[1]);
            if (metascore >= 0 && metascore <= 100) {
                return metascore;
            }
        }
    }

    return undefined;
}

function extractDirector(description: string): string | undefined {
    // Look for patterns like "directed by John Doe", "director: John Doe", "by John Doe"
    const directorPatterns = [
        /directed by ([^;]+)/i,
        /director[:\s]+([^;]+)/i,
        /by ([A-Z][a-z]+ [A-Z][a-z]+)/i
    ];

    for (const pattern of directorPatterns) {
        const match = description.match(pattern);
        if (match) {
            const director = match[1].trim();
            // Basic validation - should be at least 2 words (first and last name)
            if (director.split(' ').length >= 2) {
                return director;
            }
        }
    }

    return undefined;
}

function parseMovieSearchResponse(response: string): MovieRecommendationsOutput | null {
    try {
        const data = JSON.parse(response);

        // Check if this is already a structured response from the tool
        if (data.type === 'movie_recommendations' && data.data && data.data.recommendations) {
            return data as MovieRecommendationsOutput;
        }

        // Handle legacy array format
        if (Array.isArray(data) && data.length > 0) {
            const recommendations = data.map((movie: any) => ({
                title: movie.title || 'Unknown',
                year: movie.year || new Date().getFullYear(),
                director: movie.director || undefined,
                rating: movie.rating || undefined,
                metascore: movie.metascore || undefined,
                description: movie.description || 'No description available',
                tags: extractTags(movie.description || '')
            }));

            return {
                type: 'movie_recommendations',
                data: {
                    recommendations,
                    genre: data[0]?.genre?.toLowerCase()
                },
                metadata: {
                    title: 'Movie Recommendations',
                    description: `Found ${recommendations.length} movie recommendations`
                }
            };
        }
    } catch (error) {
        console.error('Error parsing movie search response:', error);
    }

    return null;
}

function parseImageGenerationResponse(response: string): ImageGenerationOutput | null {
    try {
        const data = JSON.parse(response);

        // Check if this is already a structured response from the tool
        if (data.type === 'image_generation' && data.data && data.data.url) {
            return data as ImageGenerationOutput;
        }

        // Handle legacy URL-only response
        if (typeof data === 'string' && data.startsWith('http')) {
            return {
                type: 'image_generation',
                data: {
                    url: data,
                    prompt: 'Generated image',
                    alt: 'Generated image'
                },
                metadata: {
                    title: 'Generated Image',
                    description: 'Image generated successfully'
                }
            };
        }
    } catch (error) {
        console.error('Error parsing image generation response:', error);
    }

    return null;
}

function parseRedditResponse(response: string): RedditPostsOutput | null {
    try {
        const data = JSON.parse(response);

        // Check if this is a structured response from the tool
        if (data.type === 'reddit_posts' && data.data && data.data.posts) {
            return data as RedditPostsOutput;
        }
    } catch (error) {
        console.error('Error parsing Reddit response:', error);
    }

    return null;
}
