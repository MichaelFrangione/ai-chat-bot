'use client';

import { StructuredOutput } from '@/types/structured';
import MovieRecommendations from './structured/MovieRecommendations';
import ImageGeneration from './structured/ImageGeneration';
import RedditPosts from './structured/RedditPosts';
import YoutubeTranscript from './structured/YoutubeTranscript';
import WebsiteScraper from './structured/WebsiteScraper';

interface StructuredOutputProps {
    output: StructuredOutput;
}

export default function StructuredOutputComponent({ output }: StructuredOutputProps) {
    switch (output.type) {
        case 'movie_recommendations':
            return <MovieRecommendations output={output} />;
        case 'image_generation':
            return <ImageGeneration output={output} />;
        case 'reddit_posts':
            return <RedditPosts output={output} />;
        case 'youtube_transcriber':
            return <YoutubeTranscript output={output} />;
        case 'website_scraper':
            return <WebsiteScraper output={output} />;
        default:
            return null;
    }
}
