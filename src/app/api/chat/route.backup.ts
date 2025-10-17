import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/agent';
import { tools } from '@/tools';
import { v4 as uuidv4 } from 'uuid';

// Add global error handlers for production debugging
if (process.env.NODE_ENV === 'production') {
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
    });
}

export async function POST(request: NextRequest) {
    try {
        console.log('=== CHAT API REQUEST START ===');
        console.log('Request headers:', Object.fromEntries(request.headers.entries()));

        // Check critical environment variables
        console.log('Environment check:', {
            NODE_ENV: process.env.NODE_ENV,
            hasOpenAIKey: !!process.env.OPENAI_API_KEY,
            hasRedisUrl: !!process.env.UPSTASH_REDIS_REST_URL,
            hasRedisToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
            hasVectorUrl: !!process.env.UPSTASH_VECTOR_REST_URL,
            hasVectorToken: !!process.env.UPSTASH_VECTOR_REST_TOKEN,
            hasRedditClientId: !!process.env.REDDIT_CLIENT_ID,
            hasRedditClientSecret: !!process.env.REDDIT_CLIENT_SECRET,
        });

        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is not set');
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        let requestBody;
        try {
            requestBody = await request.json();
            console.log('Request body parsed successfully');
        } catch (error) {
            console.error('Error parsing request JSON:', error);
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            );
        }

        const { message, personality } = requestBody;

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
        console.log('=== AGENT EXECUTION START ===');
        console.log('Message:', message.substring(0, 100) + '...');
        console.log('Personality:', personality);
        console.log('Session ID:', sessionId);
        console.log('Available tools:', tools.map(t => t.name || 'unnamed'));

        let result;
        try {
            result = await runAgent({
                userMessage: message,
                tools,
                sessionId,
                personality,
            });
            console.log('=== AGENT EXECUTION SUCCESS ===');
            console.log('Result type:', typeof result);
            console.log('Result keys:', result && typeof result === 'object' ? Object.keys(result) : 'not an object');
        } catch (agentError) {
            console.error('=== AGENT EXECUTION FAILED ===');
            console.error('Agent error:', agentError);
            console.error('Agent error name:', agentError instanceof Error ? agentError.name : 'Unknown');
            console.error('Agent error message:', agentError instanceof Error ? agentError.message : String(agentError));
            console.error('Agent error stack:', agentError instanceof Error ? agentError.stack : 'No stack trace');

            // Return a structured error response instead of letting it bubble up
            return NextResponse.json({
                success: false,
                error: 'Agent execution failed',
                details: agentError instanceof Error ? agentError.message : 'Unknown error',
                errorType: agentError instanceof Error ? agentError.name : 'Unknown',
                messages: []
            }, { status: 500 });
        }

        // Process the result safely
        console.log('=== RESPONSE PROCESSING START ===');
        const r: any = result as any;
        let resBody;

        try {
            resBody = r && r.needsApproval
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
            console.log('Response body created successfully');
            console.log('Response body keys:', Object.keys(resBody));
        } catch (responseError) {
            console.error('=== RESPONSE PROCESSING FAILED ===');
            console.error('Response processing error:', responseError);
            return NextResponse.json({
                success: false,
                error: 'Response processing failed',
                messages: []
            }, { status: 500 });
        }

        // Create response with error handling
        console.log('=== JSON SERIALIZATION START ===');
        let res;
        try {
            res = NextResponse.json(resBody);
            for (const c of responseCookies) {
                res.cookies.set(c.name, c.value, c.options);
            }
            console.log('=== JSON SERIALIZATION SUCCESS ===');
        } catch (jsonError) {
            console.error('=== JSON SERIALIZATION FAILED ===');
            console.error('JSON serialization error:', jsonError);
            console.error('Response body that failed:', JSON.stringify(resBody, null, 2));
            return NextResponse.json({
                success: false,
                error: 'Response serialization failed',
                messages: []
            }, { status: 500 });
        }

        console.log('=== CHAT API REQUEST SUCCESS ===');
        return res;
    } catch (error) {
        console.error('=== CHAT API REQUEST FAILED ===');
        console.error('Top-level error:', error);
        console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

