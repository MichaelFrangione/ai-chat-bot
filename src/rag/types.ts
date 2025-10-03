export interface MovieMetadata {
    title: string;
    year: number;
    genre: string;
    director: string;
    actors: string;
    rating: number;
    votes: number;
    revenue: number;
    metascore: number;
    description: string;
    [key: string]: string | number;
}