import OpenAI from 'openai';

export type AIMessage =
  | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
  | { role: 'user'; content: string; }
  | { role: 'tool'; content: string; tool_call_id: string; }
  | { role: 'assistant'; content?: string; tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]; };

export interface ToolFn<A = any, T = any> {
  (input: { userMessage: string; toolArgs: A; personality?: import('./src/constants/personalities').PersonalityKey; }): Promise<T>;
}
