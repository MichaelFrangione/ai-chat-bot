import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/agent';
import { tools } from '@/tools';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const { message, personality } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Read or create session cookie
        const cookieStore = request.cookies;
        let sessionId = cookieStore.get('sid')?.value;
        const responseCookies: { name: string; value: string; options?: any; }[] = [];
        if (!sessionId) {
            sessionId = uuidv4();
            responseCookies.push({
                name: 'sid',
                value: sessionId,
                options: {
                    httpOnly: true,
                    path: '/',
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 30,
                },
            });
        }

        // Run the agent with the user message and session
        const result = await runAgent({
            userMessage: message,
            tools,
            sessionId,
            personality,
        });

        const r: any = result as any;
        const resBody = r && r.needsApproval
            ? {
                success: true,
                messages: r.messages,
                needsApproval: true,
                approvalType: r.approvalType,
                toolCall: r.toolCall,
            }
            : {
                success: true,
                messages: result,
            };

        const res = NextResponse.json(resBody);
        for (const c of responseCookies) {
            res.cookies.set(c.name, c.value, c.options);
        }
        return res;
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
