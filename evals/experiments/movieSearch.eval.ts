import { runLLM } from '../../src/llm';
import { movieSearchTool } from '../../src/tools/movieSearch';
import { runEval } from '../evalTools';
import { ToolCallMatch, ToolCallWithParams, MovieSearchParamsMatch } from '../scorers';

const createToolCallMessage = (toolName: string) => ({
    role: 'assistant',
    tool_calls: [
        {
            type: 'function',
            function: {
                name: toolName,
            },
        },
    ],
});

runEval('movieSearch', {
    task: (input) =>
        runLLM({
            messages: [{ role: 'user', content: input }],
            tools: [movieSearchTool],
        }),
    data: [
        // Basic movie requests - AI uses keyword search and defaults to limit=1
        {
            input: 'suggest me a good action movie',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: null, expectedLimit: 1 }),
        },
        {
            input: "i want to find a movie about aliens coming to earth can you give me some recommendations?",
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: null, expectedLimit: 1 }),
        },
        {
            input: 'find me some movies based in italy and heist themed movies',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: null, expectedLimit: 1 }),
        },

        // Single movie requests (should use limit=1)
        {
            input: 'give me the ultimate sci-fi movie',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedLimit: 1 }),
        },
        {
            input: 'what is the best action movie ever made?',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedLimit: 1 }),
        },
        {
            input: 'recommend me one comedy movie',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedLimit: 1 }),
        },
        {
            input: 'what is the top horror movie?',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedLimit: 1 }),
        },

        // Multiple movie requests - AI defaults to limit=1 for single recommendations
        {
            input: 'show me some comedy movies',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: null, expectedLimit: 1 }),
        },
        {
            input: 'recommend me some thriller movies',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: null, expectedLimit: 1 }),
        },
        {
            input: 'give me movie recommendations for a date night',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: null, expectedLimit: 1 }),
        },
        {
            input: 'movie recommendations please',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: null, expectedLimit: 1 }),
        },
        {
            input: 'help me find a movie to watch',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: null, expectedLimit: 1 }),
        },

        // Genre-specific requests
        {
            input: 'I want to watch a horror movie',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: 'Horror' }),
        },
        {
            input: 'show me drama movies',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: 'Drama' }),
        },
        {
            input: 'find me romantic comedy movies',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: 'Romance' }),
        },

        // Director-specific requests
        {
            input: 'show me movies by Christopher Nolan',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedDirector: 'Christopher Nolan' }),
        },
        {
            input: 'what movies has Steven Spielberg directed?',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedDirector: 'Steven Spielberg' }),
        },
        {
            input: 'find me Quentin Tarantino films',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedDirector: 'Quentin Tarantino' }),
        },

        // Thematic requests (should use keyword search, not genre filters)
        {
            input: 'movies about space exploration',
            expected: createToolCallMessage('movie_search'),
        },
        {
            input: 'family-friendly movies about pets',
            expected: createToolCallMessage('movie_search'),
        },
        {
            input: 'movies set in the 1920s',
            expected: createToolCallMessage('movie_search'),
        },
        {
            input: 'time travel movies',
            expected: createToolCallMessage('movie_search'),
        },
        {
            input: 'movies about artificial intelligence',
            expected: createToolCallMessage('movie_search'),
        },

        // Complex requests
        {
            input: 'show me the best Christopher Nolan sci-fi movie',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedDirector: 'Christopher Nolan', expectedLimit: 1 }),
        },
        {
            input: 'give me 3 comedy movies from the 90s',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: 'Comedy' }),
        },

        // Edge cases
        {
            input: 'movie recommendations please',
            expected: createToolCallMessage('movie_search'),
        },
        {
            input: 'help me find a movie to watch',
            expected: createToolCallMessage('movie_search'),
        },
    ],
    scorers: [ToolCallMatch, ToolCallWithParams, MovieSearchParamsMatch],
});