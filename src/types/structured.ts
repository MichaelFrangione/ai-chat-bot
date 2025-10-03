export interface MovieRecommendation {
    title: string;
    year: number;
    description: string;
    genre?: string;
    director?: string;
    rating?: number;
    metascore?: number;
    tags?: string[];
}

export interface MovieRecommendationsOutput {
    type: 'movie_recommendations';
    data: {
        recommendations: MovieRecommendation[];
        query?: string;
        genre?: string;
    };
    metadata: {
        title: string;
        description: string;
    };
    contextualMessage?: string;
}

export interface ImageGenerationOutput {
    type: 'image_generation';
    data: {
        url: string;
        prompt: string;
        alt?: string;
    };
    metadata: {
        title: string;
        description: string;
    };
    contextualMessage?: string;
}

export type StructuredOutput = MovieRecommendationsOutput | ImageGenerationOutput;
