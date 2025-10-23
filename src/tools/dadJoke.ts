import { z } from "zod";
import fetch from "node-fetch";


// AI SDK tool - proper format with inputSchema
export const dadJokeTool = {
    description: "Get a random dad joke. Use this when the user asks for a joke or wants to laugh.",
    inputSchema: z.object({}),
    execute: async ({ }: {}) => {
        const response = await fetch("https://icanhazdadjoke.com/", {
            headers: {
                Accept: "application/json"
            }
        });
        const data = (await response.json()) as any;
        console.log('Dad joke:', data.joke);
        return data.joke;
    }
};