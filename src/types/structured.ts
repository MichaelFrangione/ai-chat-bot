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
    aiChosenMovie?: MovieRecommendation;
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

export interface RedditPost {
    title: string;
    link: string;
    subreddit: string;
    author: string;
    upvotes: number;
    comments: number;
    redditUrl?: string;
    thumbnail?: string | null;
    isVideo?: boolean;
    domain?: string;
}

export interface RedditPostsOutput {
    type: 'reddit_posts';
    data: {
        posts: RedditPost[];
        subreddit?: string;
        sortBy?: string;
    };
    metadata: {
        title: string;
        description: string;
    };
    contextualMessage?: string;
}

export interface YoutubeTranscriptChunk {
    text: string;
    score: number;
    metadata: {
        source: string;
        video_id: string;
        title: string;
        timestamp: number;
    };
}

export interface YoutubeTranscriberOutput {
    type: 'youtube_transcriber';
    data: {
        relevant: YoutubeTranscriptChunk[];
    };
    metadata: {
        title: string;
        description: string;
    };
    contextualMessage?: string;
}

export type StructuredOutput = MovieRecommendationsOutput | ImageGenerationOutput | RedditPostsOutput | YoutubeTranscriberOutput;
