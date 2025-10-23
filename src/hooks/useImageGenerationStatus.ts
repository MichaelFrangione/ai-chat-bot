export function useImageGenerationStatus(messages: any[]) {
  // Check if we're waiting for user input (image generation approval)
  const isWaitingForUserInput = messages.some(message =>
    message.parts?.some((part: any) =>
      part.type === 'tool-generate_image' && part.state === 'input-available'
    )
  );
  
  return { isWaitingForUserInput };
}
