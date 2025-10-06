import { NextRequest, NextResponse } from 'next/server';
import { getMessages } from '@/memory';

export async function GET(request: NextRequest) {
    try {
        const sessionId = request.cookies.get('sid')?.value;
        const messages = await getMessages(sessionId);

        return NextResponse.json({
            success: true,
            messages
        });

    } catch (error) {
        console.error('Messages API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
