import { NextResponse } from 'next/server';
import { getMessages } from '@/memory';

export async function GET() {
    try {
        const messages = await getMessages();

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
