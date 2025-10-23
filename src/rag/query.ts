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
            .map(([key, value]) => {
                // Special handling for genre filter - use GLOB for pattern matching
                if (key === 'genre') {
                    return `genre GLOB '*${value}*'`;
                }
                // Special handling for numeric fields like year
                if (key === 'year' && typeof value === 'number') {
                    return `${key}=${value}`;
                }
                return `${key}='${value}'`;
            });

        if (filterParts.length > 0) {
            filterStr = filterParts.join(' AND ');
        }
    }

    try {
        // Test with a simple filter first
        const queryParams: any = {
            data: query,
            topK,
            includeMetadata: true,
            includeData: true,
        };

        // Add filter if it exists
        if (filterStr) {
            queryParams.filter = filterStr;
        }

        const results = await index.query(queryParams);

        return results;
    } catch (error) {
        console.error('Upstash query error:', error);
        throw error;
    }
};