import { StructuredOutput } from './structured';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'tool';
    content: string;
    id?: string;
    createdAt?: string;
    tool_call_id?: string;
    tool_calls?: Array<{
        id: string;
        type: string;
        function: {
            name: string;
            arguments: string;
        };
    }>;
    structuredOutput?: StructuredOutput;
}

export interface ChatResponse {
    success: boolean;
    messages: ChatMessage[];
    error?: string;
    needsApproval?: boolean;
    approvalType?: string;
    toolCall?: {
        id: string;
        type: string;
        function: {
            name: string;
            arguments: string;
        };
    };
}

export interface ApprovalRequest {
    toolName: string;
    toolArgs: any;
    message: string;
}
