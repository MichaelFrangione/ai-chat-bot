import { dadJokeToolDefinition, dadJokeTool } from "./dadJoke";
import { generateImageToolDefinition, generateImageTool, askForImageApprovalTool } from "./generateImage";
import { movieSearchToolDefinition, movieSearchTool } from "./movieSearch";
import { redditToolDefinition, redditTool } from "./reddit";
import { youtubeTranscriberToolDefinition, youtubeTranscriberTool } from "./youtubeTranscriber";
import { websiteScraperToolDefinition, websiteScraperTool } from "./websiteScraper";

// Legacy tool definitions (for backward compatibility)
export const tools = [
    dadJokeToolDefinition,
    generateImageToolDefinition,
    redditToolDefinition,
    movieSearchToolDefinition,
    youtubeTranscriberToolDefinition,
    websiteScraperToolDefinition,
];

// AI SDK tools (new format with inputSchema)
export const aiSdkTools = {
    dad_joke: dadJokeTool,
    askForImageApproval: askForImageApprovalTool,
    generate_image: generateImageTool,
    reddit: redditTool,
    movie_search: movieSearchTool,
    youtubeTranscriber: youtubeTranscriberTool,
    websiteScraper: websiteScraperTool,
};