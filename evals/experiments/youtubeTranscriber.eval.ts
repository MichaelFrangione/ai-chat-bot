import { runLLM } from '../../src/llm';
import { youtubeTranscriberToolDefinition } from '../../src/tools/youtubeTranscriber';
import { runEval } from '../evalTools';
import { ToolCallMatch } from '../scorers';

const createToolCallMessage = (toolName: string) => ({
    role: 'assistant',
    tool_calls: [
        {
            type: 'function',
            function: {
                name: toolName,
            },
        },
    ],
});

runEval('youtubeTranscriber', {
    task: (input) =>
        runLLM({
            messages: [{ role: 'user', content: input }],
            tools: [youtubeTranscriberToolDefinition],
        }),
    data: [
        // Direct video URL with question
        {
            input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ what are the main points in this video?',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },
        {
            input: 'can you tell me what https://www.youtube.com/watch?v=dQw4w9WgXcQ is about?',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },

        // Summarization requests
        {
            input: 'summarize this youtube video: https://www.youtube.com/watch?v=abc123',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },
        {
            input: 'give me a summary of https://youtu.be/xyz789',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },
        {
            input: 'what is the summary of this video https://www.youtube.com/watch?v=test123',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },

        // Specific questions about video content
        {
            input: 'https://www.youtube.com/watch?v=abc what are all the reasons mentioned in this video?',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },
        {
            input: 'what was the final conclusion of this video? https://youtu.be/example',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },
        {
            input: 'can you find the part where they talk about AI in this video: https://www.youtube.com/watch?v=tech123',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },

        // Key points and takeaways
        {
            input: 'what are the key takeaways from https://www.youtube.com/watch?v=learn123',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },
        {
            input: 'list the main arguments in this video https://youtu.be/debate456',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },

        // Different URL formats
        {
            input: 'analyze this video: https://youtu.be/short123',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },
        {
            input: 'what does https://www.youtube.com/watch?v=embed456&t=30s say about climate change?',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },

        // Complex questions
        {
            input: 'https://www.youtube.com/watch?v=tutorial123 how do they explain the concept and what examples do they use?',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },
        {
            input: 'compare the different viewpoints presented in this video: https://youtu.be/analysis789',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },
    ],
    scorers: [ToolCallMatch],
});

