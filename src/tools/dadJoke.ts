import { z } from "zod";
import type { ToolFn } from "../../types";
import fetch from "node-fetch";

// Legacy definition for backwards compatibility
export const dadJokeToolDefinition = {
    name: "dad_joke",
    parameters: z.object({}),
    description: "Get a random dad joke",
};

type Args = z.infer<typeof dadJokeToolDefinition.parameters>;

// Legacy function
export const dadJoke: ToolFn<Args, string> = async ({ toolArgs }) => {
    const response = await fetch("https://icanhazdadjoke.com/", {
        headers: {
            Accept: "application/json"
        }
    });
    const data = (await response.json()) as any;
    return data.joke;
};

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