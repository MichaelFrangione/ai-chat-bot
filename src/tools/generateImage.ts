import type { ToolFn } from "../../types";
import { z } from "zod";
import { openai } from "../ai";

export const generateImageToolDefinition = {
    name: "generate_image",
    parameters: z.object({
        prompt: z.string().describe("The prompt to use to generate an image or take a photo."),
    }),
    description: `use this tool with a prompt to generate or take a photo of anything.
                `,
};

type Args = z.infer<typeof generateImageToolDefinition.parameters>;

export const generateImage: ToolFn<Args, string> = async ({ toolArgs, userMessage }: { toolArgs: Args; userMessage: string; }) => {

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `${toolArgs.prompt}, the user's original message is: ${userMessage}`,
        n: 1,
        size: "1024x1024",
    });

    const imageUrl = response?.data?.[0]?.url;

    if (!imageUrl) {
        return "Error: Could not generate image";
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
        contextualMessage: `I've generated an image based on your request. Here's what I created for you:`
    };

    return JSON.stringify(structuredResponse, null, 2);
};