import { useState, useEffect } from 'react';

export function useAssistantStatus(messages: any[], status: string) {
  const [isAssistantResponding, setIsAssistantResponding] = useState(false);
  
  useEffect(() => {
    // Find the last assistant message
    const lastAssistantMessage = [...messages].reverse().find(
      (msg) => msg.role === 'assistant'
    );

    // Check if the last assistant message has content
    const hasContent = lastAssistantMessage && (lastAssistantMessage as any).parts && (lastAssistantMessage as any).parts.length > 0;

    // Determine if the assistant has finished responding
    const isAssistantDone = status === 'ready' && hasContent;

    // Hide suggestions when assistant is responding, show when done or no messages
    setIsAssistantResponding(!isAssistantDone && messages.length > 0);
  }, [status, messages]);
  
  return { isAssistantResponding };
}
