import { dadJokeTool } from "./dadJoke";
import { generateImageTool, askForImageApprovalTool } from "./generateImage";
import { movieSearchTool } from "./movieSearch";
import { redditTool } from "./reddit";
import { youtubeTranscriberTool } from "./youtubeTranscriber";
import { websiteScraperTool } from "./websiteScraper";

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