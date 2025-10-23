import ImageGenerationApproval from '../ImageGenerationApproval';
import StructuredOutputComponent from '../StructuredOutput';
import { parseToolResponse } from '@/lib/structured-parser';

interface ToolRendererProps {
  part: any;
  index: number;
  addToolResult: (result: any) => void;
}

export default function ToolRenderer({ part, index, addToolResult }: ToolRendererProps) {
  switch (part.type) {
    case 'tool-dad_joke':
      return <DadJokeTool part={part} index={index} />;
    
    case 'tool-movie_search':
      return <MovieSearchTool part={part} index={index} />;
    
    case 'tool-reddit':
      return <RedditTool part={part} index={index} />;
    
    case 'tool-youtubeTranscriber':
      return <YoutubeTool part={part} index={index} />;
    
    case 'tool-websiteScraper':
      return <WebsiteTool part={part} index={index} />;
    
    case 'tool-generate_image':
      return <ImageGenerationTool part={part} index={index} addToolResult={addToolResult} />;
    
    default:
      return null;
  }
}

// Individual tool components
function DadJokeTool({ part, index }: { part: any; index: number }) {
  switch (part.state) {
    case 'input-streaming':
    case 'input-available':
    case 'output-available':
      // Let fallback loading text handle all these states
      return null;
    case 'output-error':
      return (
        <div key={index} className="text-red-500">
          Error: {part.errorText}
        </div>
      );
    default:
      return null;
  }
}

function MovieSearchTool({ part, index }: { part: any; index: number }) {
  switch (part.state) {
    case 'input-streaming':
    case 'input-available':
      return (
        <div key={index} className="text-xs opacity-75 italic">
          Searching for movies...
        </div>
      );
    case 'output-available':
      // Parse the structured response and render it
      const structuredOutput = parseToolResponse('movie_search', part.output as string);
      if (structuredOutput) {
        return (
          <div key={index}>
            <StructuredOutputComponent output={structuredOutput} />
          </div>
        );
      }
      // Fallback to plain text if parsing fails
      return (
        <div key={index} className="text-sm">
          {part.output}
        </div>
      );
    case 'output-error':
      return (
        <div key={index} className="text-red-500">
          Error: {part.errorText}
        </div>
      );
    default:
      return null;
  }
}

function RedditTool({ part, index }: { part: any; index: number }) {
  switch (part.state) {
    case 'input-streaming':
    case 'input-available':
      return (
        <div key={index} className="text-xs opacity-75 italic">
          Fetching Reddit posts...
        </div>
      );
    case 'output-available':
      // Parse the structured response and render it
      const redditOutput = parseToolResponse('reddit', part.output as string);
      if (redditOutput) {
        return (
          <div key={index}>
            <StructuredOutputComponent output={redditOutput} />
          </div>
        );
      }
      // Fallback to plain text if parsing fails
      return (
        <div key={index} className="text-sm">
          {part.output}
        </div>
      );
    case 'output-error':
      return (
        <div key={index} className="text-red-500">
          Error: {part.errorText}
        </div>
      );
    default:
      return null;
  }
}

function YoutubeTool({ part, index }: { part: any; index: number }) {
  switch (part.state) {
    case 'input-streaming':
    case 'input-available':
      return (
        <div key={index} className="text-xs opacity-75 italic">
          Analyzing YouTube video transcript...
        </div>
      );
    case 'output-available':
      // Parse the structured response and render it
      const youtubeOutput = parseToolResponse('youtubeTranscriber', part.output as string);
      if (youtubeOutput) {
        return (
          <div key={index}>
            <StructuredOutputComponent output={youtubeOutput} />
          </div>
        );
      }
      // Fallback to plain text if parsing fails
      return (
        <div key={index} className="text-sm">
          {part.output}
        </div>
      );
    case 'output-error':
      return (
        <div key={index} className="text-red-500">
          Error: {part.errorText}
        </div>
      );
    default:
      return null;
  }
}

function WebsiteTool({ part, index }: { part: any; index: number }) {
  switch (part.state) {
    case 'input-streaming':
    case 'input-available':
      return (
        <div key={index} className="text-xs opacity-75 italic">
          Analyzing website content...
        </div>
      );
    case 'output-available':
      // Parse the structured response and render it
      const websiteOutput = parseToolResponse('websiteScraper', part.output as string);
      if (websiteOutput) {
        return (
          <div key={index}>
            <StructuredOutputComponent output={websiteOutput} />
          </div>
        );
      }
      // Fallback to plain text if parsing fails
      return (
        <div key={index} className="text-sm">
          {part.output}
        </div>
      );
    case 'output-error':
      return (
        <div key={index} className="text-red-500">
          Error: {part.errorText}
        </div>
      );
    default:
      return null;
  }
}

function ImageGenerationTool({ part, index, addToolResult }: { part: any; index: number; addToolResult: (result: any) => void }) {
  const callId = part.toolCallId;

  switch (part.state) {
    case 'input-streaming':
      return (
        <div key={index} className="text-xs opacity-75 italic">
          Preparing image request...
        </div>
      );
    case 'input-available':
      // Show approval UI
      return (
        <ImageGenerationApproval
          key={index}
          prompt={part.input.prompt}
          onApprove={() => {
            console.log('✅ User approved image generation');
            addToolResult({
              tool: 'generate_image',
              toolCallId: callId,
              output: 'APPROVED'
            });
          }}
          onDeny={() => {
            console.log('❌ User denied image generation');
            addToolResult({
              tool: 'generate_image',
              toolCallId: callId,
              output: 'DENIED'
            });
          }}
        />
      );
    case 'output-available':
      // Show the generated image or approval result
      return (
        <div key={index}>
          {part.output === 'APPROVED' || part.output === 'DENIED' ? (
            <div className="text-xs opacity-75 italic">
              {part.output === 'APPROVED' ? '✅ Generating image...' : '❌ Image generation cancelled'}
            </div>
          ) : (
            // Parse the structured response and render it
            (() => {
              try {
                console.log('🔍 Image generation output:', part.output);

                // Check if it's already a structured object
                if (typeof part.output === 'object' && part.output.type === 'image_generation') {
                  return <StructuredOutputComponent output={part.output} />;
                }

                // Otherwise try to parse as string
                const imageOutput = parseToolResponse('generate_image', part.output as string);
                if (imageOutput) {
                  return <StructuredOutputComponent output={imageOutput} />;
                }
              } catch (error) {
                console.error('Error parsing image generation output:', error);
              }
              // Fallback to plain image if parsing fails
              return <img src={part.output as string} alt="Generated" className="rounded-lg max-w-full" />;
            })()
          )}
        </div>
      );
    case 'output-error':
      return (
        <div key={index} className="text-red-500">
          Error: {part.errorText}
        </div>
      );
    default:
      return null;
  }
}
