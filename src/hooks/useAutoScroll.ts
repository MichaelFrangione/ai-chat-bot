import { useEffect, useRef } from 'react';

export function useAutoScroll(messages: any[]) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Use requestAnimationFrame to wait for DOM updates
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    });
  }, [messages]);
  
  return { messagesContainerRef };
}
