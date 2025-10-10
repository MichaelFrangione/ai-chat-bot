import { dadJokeToolDefinition } from "./dadJoke";
import { generateImageToolDefinition } from "./generateImage";
import { movieSearchToolDefinition } from "./movieSearch";
import { redditToolDefinition } from "./reddit";
import { youtubeTranscriberToolDefinition } from "./YoutubeTranscriber";

export const tools = [
    dadJokeToolDefinition,
    generateImageToolDefinition,
    redditToolDefinition,
    movieSearchToolDefinition,
    youtubeTranscriberToolDefinition,
];