'use client';

import { StructuredOutput } from '@/types/structured';
import MovieRecommendations from './structured/MovieRecommendations';
import ImageGeneration from './structured/ImageGeneration';

interface StructuredOutputProps {
    output: StructuredOutput;
}

export default function StructuredOutputComponent({ output }: StructuredOutputProps) {
    switch (output.type) {
        case 'movie_recommendations':
            return <MovieRecommendations output={output} />;
        case 'image_generation':
            return <ImageGeneration output={output} />;
        default:
            return null;
    }
}
