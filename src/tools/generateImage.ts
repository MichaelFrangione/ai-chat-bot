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