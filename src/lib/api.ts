// API client for chat operations
// Note: This file is kept for legacy compatibility but most methods are unused
// The new system uses the AI SDK with streaming in ChatInterfaceNew
const API_BASE = '/api';

export class ChatAPI {
    // Legacy method - unused in new system
    static async sendMessage(message: string, personality?: string): Promise<any> {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, personality }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Legacy method - unused in new system
    static async getMessages(): Promise<any> {
        console.warn('ChatAPI.getMessages is deprecated');
        return { success: false, messages: [] };
    }

    // Legacy method - unused in new system
    static async approveAction(approval: boolean): Promise<any> {
        console.warn('ChatAPI.approveAction is deprecated');
        return { success: false };
    }

    // Legacy method - unused in new system
    static async resetChat(): Promise<{ success: boolean; message?: string; error?: string; }> {
        console.warn('ChatAPI.resetChat is deprecated');
        return { success: false, error: 'This method is deprecated' };
    }
}
