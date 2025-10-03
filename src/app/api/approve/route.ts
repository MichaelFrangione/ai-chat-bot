import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/agent';
import { tools } from '@/tools';

export async function POST(request: NextRequest) {
    try {
        const { approval } = await request.json();

        if (typeof approval !== 'boolean') {
            return NextResponse.json(
                { error: 'Approval must be a boolean' },
                { status: 400 }
            );
        }

        // Convert approval to user message format
        const userMessage = approval ? 'yes' : 'no';

        // Run the agent with the approval response
        const result = await runAgent({
            userMessage,
            tools,
            isApproval: true
        });

        return NextResponse.json({
            success: true,
            messages: result
        });

    } catch (error) {
        console.error('Approve API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
