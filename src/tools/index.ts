import { dadJokeToolDefinition } from "./dadJoke";
import { generateImageToolDefinition } from "./generateImage";
import { movieSearchToolDefinition } from "./movieSearch";
import { redditToolDefinition } from "./reddit";
import { youtubeTranscriberToolDefinition } from "./youtubeTranscriber";
import { websiteScraperToolDefinition } from "./websiteScraper";

export const tools = [
    dadJokeToolDefinition,
    generateImageToolDefinition,
    redditToolDefinition,
    movieSearchToolDefinition,
    youtubeTranscriberToolDefinition,
    websiteScraperToolDefinition,
];