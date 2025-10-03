# AI Chatbot Agent

A sophisticated AI-powered chatbot agent built with Next.js, TypeScript, and OpenAI's GPT models. This agent can perform various tasks through specialized tools including movie recommendations, image generation, Reddit browsing, and dad jokes.

## 🚀 Features

### Core Capabilities
- **Interactive Chat Interface**: Modern, responsive web UI built with React and Tailwind CSS
- **Multi-Tool Agent**: Seamlessly integrates multiple specialized tools for different tasks
- **Structured Output**: Rich, formatted responses with specialized components for different content types
- **Approval System**: User approval workflow for sensitive operations like image generation
- **Memory Management**: Persistent conversation history using LowDB
- **RAG Integration**: Vector search capabilities for movie recommendations using Upstash Vector

### Available Tools

1. **🎬 Movie Search & Recommendations**
   - Search through a comprehensive movie database
   - Filter by genre, director, year, and other criteria
   - Powered by RAG (Retrieval-Augmented Generation) with vector embeddings
   - Structured output with movie cards and detailed information

2. **🎨 Image Generation**
   - Generate images using DALL-E 3
   - User approval workflow for image generation requests
   - Structured output with image display components

3. **😄 Dad Jokes**
   - Fetch random dad jokes from icanhazdadjoke.com API
   - Light entertainment feature

4. **🔗 Reddit Integration**
   - Browse trending posts from Reddit
   - Fetch current discussions and popular content

### Development Features
- **Evaluation Framework**: Comprehensive testing suite with automated evaluations
- **Developer Mode**: Toggle to view tool usage and debugging information
- **TypeScript**: Full type safety throughout the application
- **Hot Reload**: Fast development with Next.js dev server

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework

### Backend & AI
- **OpenAI GPT-4** - Language model for chat completions
- **DALL-E 3** - Image generation
- **Upstash Vector** - Vector database for RAG
- **LowDB** - Lightweight JSON database for memory

### Development Tools
- **Autoevals** - Automated evaluation framework
- **Chalk** - Terminal styling
- **Ora** - Elegant terminal spinners
- **Zod** - TypeScript-first schema validation

## 📋 Prerequisites

- **Node.js 20+** or **Bun v1.0.20+**
- **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/settings/organization/api-keys)
- **Upstash Vector Database** - For movie search RAG functionality

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd chatbot-agent
npm install
# or
bun install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
UPSTASH_VECTOR_REST_URL=your_upstash_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token
```

### 3. Set Up Movie Database (Optional)

If you want to use movie search functionality, ingest the movie dataset:

```bash
npm run ingest
# or
bun run ingest
```

This will populate your Upstash Vector database with movie data from the included CSV file.

### 4. Run the Application

```bash
# Development mode
npm run dev
# or
bun dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`.

## 🎯 Usage

### Web Interface

1. Open `http://localhost:3000` in your browser
2. Start chatting with the AI agent
3. Try these example prompts:
   - "Find me some action movies from the 90s"
   - "Generate an image of a futuristic city"
   - "Tell me a dad joke"
   - "What's trending on Reddit?"

### Command Line Interface

You can also run the agent directly from the command line:

```bash
npm run agent "Find me a good sci-fi movie"
# or
bun run index.ts "Generate an image of a sunset"
```

### Developer Mode

Toggle developer mode in the web interface to see:
- Tool usage information
- Debug details
- Internal agent reasoning

## 🧪 Evaluation Framework

The project includes a comprehensive evaluation system to test agent performance:

```bash
# Run all evaluations
npm run eval

# Run specific evaluation
npm run eval movieSearch
npm run eval generateImage
npm run eval dadJoke
npm run eval reddit
```

Available evaluations:
- `allTools.eval.ts` - Comprehensive tool testing
- `movieSearch.eval.ts` - Movie recommendation accuracy
- `generateImage.eval.ts` - Image generation quality
- `dadJoke.eval.ts` - Dad joke functionality
- `reddit.eval.ts` - Reddit integration

## 📁 Project Structure

```
chatbot-agent/
├── src/
│   ├── agent.ts              # Main agent logic
│   ├── ai.ts                 # OpenAI client setup
│   ├── app/                  # Next.js app directory
│   │   ├── api/              # API routes
│   │   └── page.tsx          # Main page
│   ├── components/           # React components
│   │   ├── ChatInterface.tsx # Main chat UI
│   │   ├── MessageList.tsx   # Message display
│   │   ├── MessageInput.tsx  # Input component
│   │   ├── ApprovalDialog.tsx # Approval workflow
│   │   └── structured/       # Specialized output components
│   ├── tools/                # Agent tools
│   │   ├── index.ts          # Tool exports
│   │   ├── movieSearch.ts    # Movie recommendation tool
│   │   ├── generateImage.ts  # Image generation tool
│   │   ├── dadJoke.ts        # Dad joke tool
│   │   └── reddit.ts         # Reddit browsing tool
│   ├── rag/                  # RAG implementation
│   │   ├── ingest.ts         # Data ingestion
│   │   ├── query.ts          # Vector search
│   │   └── types.ts          # RAG types
│   └── lib/                  # Utilities
├── evals/                    # Evaluation framework
│   ├── experiments/          # Test cases
│   └── run.ts               # Evaluation runner
├── dashboard/               # React dashboard (separate app)
└── db.json                  # Persistent storage
```

## 🔧 Development

### Adding New Tools

1. Create a new tool file in `src/tools/`
2. Define the tool schema with Zod
3. Implement the tool function
4. Export it from `src/tools/index.ts`
5. Add evaluation tests in `evals/experiments/`

### Customizing the Agent

- **System Prompt**: Modify `src/systemPrompt.ts`
- **Memory**: Adjust `src/memory.ts` for different storage backends
- **UI Components**: Customize React components in `src/components/`
- **API Routes**: Extend Next.js API routes in `src/app/api/`

## 📊 Performance & Monitoring

The agent includes built-in performance monitoring:
- Tool execution timing
- Memory usage tracking
- Evaluation metrics
- Error handling and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes with tests
4. Run the evaluation suite
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built following the [Frontend Masters AI Agent Workshop](https://frontendmasters.com/workshops/build-ai-agent/)
- Uses OpenAI's GPT models for natural language processing
- Vector search powered by Upstash Vector
- UI components built with React and Tailwind CSS

---

**Happy chatting with your AI agent! 🤖✨**