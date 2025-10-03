# AI Chatbot Agent

A modern AI-powered chatbot built with Next.js and OpenAI's GPT models. The agent can perform various tasks through specialized tools and provides rich, interactive responses.

## 🚀 Features

### Core Capabilities
- **Interactive Chat Interface**: Clean, responsive web UI with React and Tailwind CSS
- **Multi-Tool Agent**: Integrates specialized tools for different tasks
- **Structured Output**: Rich, formatted responses with custom components
- **Approval System**: User approval for sensitive operations like image generation
- **Memory Management**: Persistent conversation history
- **RAG Integration**: Vector search for movie recommendations

### Available Tools

1. **🎬 Movie Search**
   - Search movie database with filters (genre, director, year)
   - Powered by vector embeddings and RAG
   - Returns structured movie recommendations with ratings and descriptions

2. **🎨 Image Generation**
   - Generate images using DALL-E 3
   - Requires user approval before generation
   - Displays images with download links

3. **😄 Dad Jokes**
   - Fetch random dad jokes from icanhazdadjoke.com
   - Simple entertainment feature

4. **🔗 Reddit Posts**
   - Browse trending posts from Reddit
   - Shows title, subreddit, author, and upvotes

### Development Features
- **Evaluation Framework**: Automated testing for all tools
- **Developer Mode**: Toggle to view tool usage and debug info
- **TypeScript**: Full type safety
- **Hot Reload**: Fast development with Next.js

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Backend & AI
- **OpenAI GPT-4** - Language model
- **DALL-E 3** - Image generation
- **Upstash Vector** - Vector database for movie search
- **LowDB** - JSON database for memory

### Development Tools
- **Autoevals** - Testing framework
- **Zod** - Schema validation
- **Chalk & Ora** - Terminal styling and spinners

## 📋 Prerequisites

- **Node.js 20+** or **Bun**
- **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/settings/organization/api-keys)
- **Upstash Vector Database** - For movie search (optional)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Environment Setup

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Set Up Movie Database (Optional)

```env
UPSTASH_VECTOR_REST_URL=your_upstash_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token
```

```bash
npm run ingest
```

### 4. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🎯 Usage

### Web Interface

1. Open `http://localhost:3000`
2. Start chatting with the AI
3. Try these examples:
   - "Find me some action movies from the 90s"
   - "Generate an image of a futuristic city"
   - "Tell me a dad joke"
   - "What's trending on Reddit?"

### Command Line

```bash
npm run agent "Find me a good sci-fi movie"
```

### Developer Mode

Toggle dev mode in the UI to see tool usage and debug info.

## 🧪 Testing

Run evaluations to test agent performance:

```bash
# Run all tests
npm run eval

# Run specific tests
npm run eval movieSearch
npm run eval generateImage
npm run eval dadJoke
npm run eval reddit
```

## 📁 Project Structure

```
chatbot-agent/
├── src/
│   ├── agent.ts              # Main agent logic
│   ├── ai.ts                 # OpenAI client
│   ├── app/                  # Next.js app
│   │   ├── api/              # API routes
│   │   └── page.tsx          # Main page
│   ├── components/           # React components
│   │   ├── ChatInterface.tsx # Chat UI
│   │   ├── MessageBubble.tsx # Message display
│   │   ├── MessageInput.tsx  # Input component
│   │   ├── ApprovalDialog.tsx # Approval workflow
│   │   └── structured/       # Output components
│   ├── tools/                # Agent tools
│   │   ├── index.ts          # Tool exports
│   │   ├── movieSearch.ts    # Movie search
│   │   ├── generateImage.ts  # Image generation
│   │   ├── dadJoke.ts        # Dad jokes
│   │   └── reddit.ts         # Reddit posts
│   ├── rag/                  # Vector search
│   │   ├── ingest.ts         # Data ingestion
│   │   ├── query.ts          # Search queries
│   │   └── types.ts          # Types
│   └── lib/                  # Utilities
├── evals/                    # Testing
│   ├── experiments/          # Test cases
│   └── run.ts               # Test runner
└── db.json                  # Storage
```

## 🔧 Development

### Adding New Tools

1. Create tool file in `src/tools/`
2. Define schema with Zod
3. Implement tool function
4. Export from `src/tools/index.ts`
5. Add tests in `evals/experiments/`

### Customizing

- **System Prompt**: `src/systemPrompt.ts`
- **Memory**: `src/memory.ts`
- **UI**: `src/components/`
- **API**: `src/app/api/`

## 📝 License

MIT License

---

**Happy chatting! 🤖✨**