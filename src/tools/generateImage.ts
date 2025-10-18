import type { ToolFn } from "../../types";
import { z } from "zod";
import { openai } from "../ai";
import { PersonalityKey } from "../constants/personalities";
import { styleWithPersona } from "../lib/persona-styler";

export const generateImageToolDefinition = {
    name: "generate_image",
    parameters: z.object({
        prompt: z.string().describe("The prompt to use to generate an image or take a photo."),
    }),
    description: `use this tool with a prompt to generate or take a photo of anything.
                `,
};

// AI SDK tool - For validation only (execution handled manually in route)
export const generateImageValidationTool = {
    description: 'Generate an image from a text prompt. Use this when user asks to create, generate, or make an image.',
    inputSchema: z.object({
        prompt: z.string().describe('The prompt to use to generate an image or take a photo'),
    }),
};

type Args = z.infer<typeof generateImageToolDefinition.parameters>;

export const generateImage: ToolFn<Args, string> = async ({ toolArgs, userMessage, personality }: { toolArgs: Args; userMessage: string; personality?: PersonalityKey; }) => {

    // Inject light persona hint into the image prompt without changing semantics
    const personaHint = personality && personality !== 'assistant' ? ` Style: ${personality}.` : '';

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${toolArgs.prompt}, the user's original message is: ${userMessage}.${personaHint}`,
        n: 1,
        size: "1024x1024",
    });

    const imageUrl = response?.data?.[0]?.url;

    if (!imageUrl) {
        return "Error: Could not generate image";
    }

    let contextualMessage = `I've generated an image based on your request. Here's what I created for you:`;
    if (personality && personality !== 'assistant') {
        contextualMessage = await styleWithPersona(contextualMessage, personality, 'image generation');
    }

    // Return structured format for image generation
    const structuredResponse = {
        type: 'image_generation',
        data: {
            url: imageUrl,
            prompt: toolArgs.prompt,
            alt: `Generated image: ${toolArgs.prompt}`
        },
        metadata: {
            title: 'Generated Image',
            description: `Image generated from prompt: "${toolArgs.prompt}"`
        },
        contextualMessage
    };

    return JSON.stringify(structuredResponse, null, 2);
};

// AI SDK tool - Client-side approval tool (doesn't execute on server)
export const askForImageApprovalTool = {
    description: "Ask the user for approval before generating an image. ALWAYS use this before calling generate_image.",
    inputSchema: z.object({
        prompt: z.string().describe("The prompt that will be used to generate the image."),
        message: z.string().describe("A friendly message asking the user if they want to generate this image."),
    }),
    // No execute function = client-side tool that triggers user interaction
};

// AI SDK tool - Server-side image generation (executes on server after approval)
export const generateImageTool = {
    description: "Generate an image from a text prompt. This should only be called after receiving user approval via askForImageApproval.",
    inputSchema: z.object({
        prompt: z.string().describe("The prompt to use to generate an image or take a photo."),
        approved: z.boolean().describe("Whether the user approved the image generation."),
    }),
    execute: async ({ prompt, approved }: { prompt: string; approved: boolean; }, { metadata }: any) => {
        if (!approved) {
            return "User did not approve image generation at this time.";
        }

        const personality = metadata?.personality as PersonalityKey | undefined;
        const userMessage = metadata?.userMessage as string;

        const personaHint = personality && personality !== 'assistant' ? ` Style: ${personality}.` : '';

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `${prompt}, the user's original message is: ${userMessage}.${personaHint}`,
            n: 1,
            size: "1024x1024",
        });

        const imageUrl = response?.data?.[0]?.url;

        if (!imageUrl) {
            return "Error: Could not generate image";
        }

        let contextualMessage = `I've generated an image based on your request. Here's what I created for you:`;
        if (personality && personality !== 'assistant') {
            contextualMessage = await styleWithPersona(contextualMessage, personality, 'image generation');
        }

        return JSON.stringify({
            type: 'image_generation',
            data: {
                url: imageUrl,
                prompt: prompt,
                alt: `Generated image: ${prompt}`
            },
            metadata: {
                title: 'Generated Image',
                description: `Image generated from prompt: "${prompt}"`
            },
            contextualMessage
        }, null, 2);
    }
};