import type { ToolFn } from "../../types";
import fetch from "node-fetch";
import { z } from "zod";
import { styleWithPersona } from "../lib/persona-styler";
import { PersonalityKey, getPersonalityDirectives } from "../constants/personalities";
import { Innertube } from 'youtubei.js';
import { createEmbeddings, search } from "./utils";
import { openai } from "../ai";

export const youtubeTranscriberToolDefinition = {
    name: "youtubeTranscriber",
    parameters: z.object({
        videoUrl: z.string().describe("The URL of the YouTube video to analyze."),
        question: z.string().describe("The user's question or request about the video (e.g., 'what are the main points?', 'summarize this video', 'what reasons are given?')"),
    }),
    description: "Answer questions about a YouTube video by analyzing its transcript. Use this tool when users ask questions about YouTube videos, request summaries, or want to find specific information within a video.",
};

type Args = z.infer<typeof youtubeTranscriberToolDefinition.parameters>;

export const youtubeTranscriber: ToolFn<Args, string> = async ({ toolArgs, userMessage, personality }: { toolArgs: Args; userMessage: string; personality?: PersonalityKey; }) => {
    const { videoUrl, question } = toolArgs;

    try {
        console.log(`📺 Processing YouTube video: ${videoUrl}`);
        console.log(`❓ Question: ${question}`);

        // Load and process transcript
        const transcript = await loadYouTubeTranscript(videoUrl);

        // Check if we got an error response
        if (typeof transcript === 'string') {
            return transcript; // Return the error message
        }

        const documents = await createEmbeddings(transcript);

        // Find most relevant sections (get more chunks for better context)
        const relevant = await search(question, documents, 5);

        console.log(`✅ Found ${relevant.length} relevant transcript sections`);

        // Build context from relevant chunks
        const context = relevant
            .map((chunk: any, idx: number) => {
                const timestamp = formatTimestamp(chunk.metadata.timestamp);
                return `[${timestamp}] ${chunk.text}`;
            })
            .join('\n\n');

        // Build system prompt with personality if provided
        const basePrompt = `You are a helpful assistant that answers questions about YouTube videos based on their transcripts. 

Instructions:
- Answer the user's question using ONLY the provided transcript sections
- Be specific and cite timestamps when relevant
- If the transcript doesn't contain enough information to fully answer the question, say so
- For summaries, organize your response with clear structure
- For "list all reasons" type questions, provide a comprehensive numbered list
- Be concise but thorough`;

        const systemPrompt = personality && personality !== 'assistant'
            ? `${getPersonalityDirectives(personality)}

${basePrompt}

IMPORTANT: Maintain your personality throughout the ENTIRE response, not just at the beginning and end.`
            : basePrompt;

        // Use LLM to answer the question based on the transcript
        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: `Video: ${videoUrl}
Video Title: ${relevant[0]?.metadata?.title || 'Unknown'}

Question: ${question}

Relevant transcript sections:
${context}

Please answer the question based on these transcript sections.`
                }
            ],
            temperature: 1,
        });

        const answer = response.choices[0].message.content || "I couldn't generate an answer based on the transcript.";

        console.log(`💬 Generated answer (${answer.length} chars)`);
        if (personality && personality !== 'assistant') {
            console.log(`🎭 Generated with ${personality} personality integrated`);
        }

        return answer;
    } catch (error) {
        console.error('❌ Error in youtubeTranscriber:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return `I couldn't analyze the YouTube video. ${errorMessage}`;
    }
};

async function loadYouTubeTranscript(videoUrl: string): Promise<any[] | string> {
    // Extract video ID
    const videoId = videoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)?.[1];

    if (!videoId) {
        return 'Invalid YouTube URL. Please provide a valid YouTube video link.';
    }

    console.log(`📺 Fetching YouTube transcript: ${videoId}`);

    try {
        // Initialize Innertube
        const youtube = await Innertube.create();

        // Get video info
        const info = await youtube.getInfo(videoId);

        // Get transcript - this can throw if no transcript is available
        let transcriptData;
        try {
            transcriptData = await info.getTranscript();
        } catch (transcriptError) {
            return 'This video does not have a transcript available. Transcripts may be disabled or unavailable for this video.';
        }

        if (!transcriptData?.transcript?.content?.body?.initial_segments) {
            return 'No transcript segments found for this video.';
        }

        const segments = transcriptData.transcript.content.body.initial_segments;

        if (segments.length === 0) {
            return 'The transcript for this video is empty.';
        }

        const chunks = [];

        // Group segments into larger chunks (every 10 segments ≈ 30-60 seconds)
        const chunkSize = 10;
        for (let i = 0; i < segments.length; i += chunkSize) {
            const segmentGroup = segments.slice(i, i + chunkSize);
            const text = segmentGroup.map(seg => seg.snippet.text).join(' ');
            const startTime = Number(segmentGroup[0].start_ms) / 1000; // Convert to seconds

            chunks.push({
                text: text.trim(),
                metadata: {
                    source: videoUrl,
                    video_id: videoId,
                    title: info.basic_info.title || 'Unknown',
                    timestamp: startTime
                }
            });
        }

        return chunks;
    } catch (error) {
        console.error('Error loading transcript:', error);
        return `Failed to load YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

// Helper to format timestamp as MM:SS
function formatTimestamp(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}