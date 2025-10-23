import { openai } from './ai';
import type { AIMessage } from '../types';

export interface LLMOptions {
    messages: AIMessage[];
    tools?: any[];
    model?: string;
    temperature?: number;
}

export async function runLLM({ messages, tools, model = 'gpt-4o', temperature = 1 }: LLMOptions) {
    const response = await openai.chat.completions.create({
        model,
        messages: messages as any,
        tools: tools as any,
        temperature,
    });

    return response.choices[0].message;
}
