import type { Scorer } from 'autoevals';

export const ToolCallMatch: Scorer<any, {}> = async ({
    input,
    output,
    expected,
}) => {
    const score =
        output.role === 'assistant' &&
            Array.isArray(output.tool_calls) &&
            output.tool_calls.length === 1 &&
            output.tool_calls[0].function?.name ===
            expected.tool_calls[0].function?.name
            ? 1
            : 0;

    return {
        name: 'ToolCallMatch',
        score,
    };
};

export const ToolCallWithParams: Scorer<any, {}> = async ({
    input,
    output,
    expected,
}) => {
    const hasCorrectTool =
        output.role === 'assistant' &&
        Array.isArray(output.tool_calls) &&
        output.tool_calls.length === 1 &&
        output.tool_calls[0].function?.name === expected.tool_calls[0].function?.name;

    const hasCorrectParams = hasCorrectTool &&
        output.tool_calls[0].function?.arguments &&
        JSON.parse(output.tool_calls[0].function.arguments);

    const score = hasCorrectTool && hasCorrectParams ? 1 : 0;

    return {
        name: 'ToolCallWithParams',
        score,
    };
};

export const RedditParamsMatch: Scorer<any, {}> = async ({
    input,
    output,
    reference,
}) => {
    const toolCall = output.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== 'reddit') {
        return { name: 'RedditParamsMatch', score: 0 };
    }

    const args = JSON.parse(toolCall.function.arguments || '{}');
    const expected = reference ? JSON.parse(reference) : {};
    let score = 0;

    if (expected.expectedLimit !== undefined) {
        score += args.limit === expected.expectedLimit ? 0.5 : 0;
    }

    if (expected.expectedSubreddit !== undefined) {
        // Treat empty string as equivalent to null
        const actualSubreddit = args.subreddit === "" ? null : args.subreddit;
        score += actualSubreddit === expected.expectedSubreddit ? 0.5 : 0;
    }

    return {
        name: 'RedditParamsMatch',
        score: Math.min(score, 1),
    };
};

export const MovieSearchParamsMatch: Scorer<any, {}> = async ({
    input,
    output,
    reference,
}) => {
    const toolCall = output.tool_calls?.[0];
    if (!toolCall || toolCall.function?.name !== 'movie_search') {
        return { name: 'MovieSearchParamsMatch', score: 0 };
    }

    const args = JSON.parse(toolCall.function.arguments || '{}');
    const expected = reference ? JSON.parse(reference) : {};
    let score = 0;
    let totalChecks = 0;

    if (expected.expectedGenre !== undefined) {
        totalChecks++;
        // Treat empty string and "/***null***" as equivalent to null
        const actualGenre = (args.genre === "" || args.genre === "/***null***") ? null : args.genre;
        score += actualGenre === expected.expectedGenre ? 1 : 0;
    }

    if (expected.expectedDirector !== undefined) {
        totalChecks++;
        // Treat empty string and "/***null***" as equivalent to null
        const actualDirector = (args.director === "" || args.director === "/***null***") ? null : args.director;
        score += actualDirector === expected.expectedDirector ? 1 : 0;
    }

    if (expected.expectedLimit !== undefined) {
        totalChecks++;
        // For general movie requests, accept both limit: 1 and limit: 5 as valid
        if (expected.expectedLimit === 1) {
            score += (args.limit === 1 || args.limit === 5) ? 1 : 0;
        } else {
            score += args.limit === expected.expectedLimit ? 1 : 0;
        }
    }

    return {
        name: 'MovieSearchParamsMatch',
        score: totalChecks > 0 ? score / totalChecks : 0,
    };
};