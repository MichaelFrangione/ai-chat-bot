import { NextRequest, NextResponse } from 'next/server';
import { JSONFilePreset } from 'lowdb/node';
import { Redis } from '@upstash/redis';

const IS_DEV = process.env.NODE_ENV === 'development';

type Data = {
    messages: any[];
    summary: string;
};

const defaultData: Data = {
    messages: [],
    summary: '',
};

export async function POST(request: NextRequest) {
    try {
        console.log('=== RESET API REQUEST START ===');

        // Get session ID from cookie
        const cookieStore = request.cookies;
        const sessionId = cookieStore.get('sid')?.value;

        // Reset Redis in production
        if (!IS_DEV && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            try {
                const redis = new Redis({
                    url: process.env.UPSTASH_REDIS_REST_URL,
                    token: process.env.UPSTASH_REDIS_REST_TOKEN,
                });

                const sessionKey = `chatbot:session:${sessionId || 'default'}`;
                await redis.set(sessionKey, defaultData);
                console.log('Redis database reset successfully');
            } catch (error) {
                console.error('Failed to reset Redis:', error);
                return NextResponse.json(
                    { success: false, error: 'Failed to reset production database' },
                    { status: 500 }
                );
            }
        }

        // Reset local db.json in development
        if (IS_DEV) {
            try {
                const db = await JSONFilePreset<Data>('db.json', defaultData);
                db.data = { ...defaultData };
                await db.write();
                console.log('Local db.json reset successfully');
            } catch (error) {
                console.error('Failed to reset local database:', error);
                return NextResponse.json(
                    { success: false, error: 'Failed to reset local database' },
                    { status: 500 }
                );
            }
        }

        console.log('=== RESET API REQUEST SUCCESS ===');
        return NextResponse.json({ success: true, message: 'Database reset successfully' });
    } catch (error) {
        console.error('=== RESET API REQUEST FAILED ===');
        console.error('Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to reset database' },
            { status: 500 }
        );
    }
}

