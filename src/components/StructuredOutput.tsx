'use client';

import { StructuredOutput } from '@/types/structured';
import MovieRecommendations from './structured/MovieRecommendations';

interface StructuredOutputProps {
    output: StructuredOutput;
}

export default function StructuredOutputComponent({ output }: StructuredOutputProps) {
    switch (output.type) {
        case 'movie_recommendations':
            return <MovieRecommendations output={output} />;
        default:
            return null;
    }
}
