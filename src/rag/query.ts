import { Index as UpstashIndex } from '@upstash/vector';
import 'dotenv/config';
import type { MovieMetadata } from './types';

const index = new UpstashIndex();

export const queryMovies = async ({
    query,
    filters,
    topK = 5
}: {
    query: string;
    filters?: Partial<MovieMetadata>,
    topK?: number;
}) => {

    // Build filter string if filters provided
    let filterStr = '';
    if (filters) {
        const filterParts = Object.entries(filters)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => `${key}='${value}'`);

        if (filterParts.length > 0) {
            filterStr = filterParts.join(' AND ');
        }
    }

    const results = await index.query({
        data: query,
        topK,
        filter: filterStr || undefined,
        includeMetadata: true,
        includeData: true,
    });

    return results;
};