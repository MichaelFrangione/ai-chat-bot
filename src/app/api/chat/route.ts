import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/agent';
import { tools } from '@/tools';

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Run the agent with the user message
        const result = await runAgent({
            userMessage: message,
            tools
        });

        // Check if approval is needed
        if (result.needsApproval) {
            return NextResponse.json({
                success: true,
                messages: result.messages,
                needsApproval: true,
                approvalType: result.approvalType,
                toolCall: result.toolCall
            });
        }

        return NextResponse.json({
            success: true,
            messages: result
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
