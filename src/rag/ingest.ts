import 'dotenv/config';

import { Index as UpstashIndex } from '@upstash/vector';
import { parse } from 'csv-parse/sync';
import fs from 'node:fs';
import path from 'node:path';
import ora from 'ora';
import type { MovieMetadata } from './types';

const index = new UpstashIndex();

const indexMovieData = async () => {
    const spinner = ora('Reading movie data').start();
    const csvPath = path.join(process.cwd(), 'src/rag/imdb_movie_dataset.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const movies = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
    });

    spinner.text = 'Starting movie indexing';

    for (const movie of movies) {

        const { Title, Genre, Description, Year, Director, Actors, Rating, Votes, Revenue, Metascore } = movie;

        spinner.text = `Indexing movie ${Title}`;
        const text = `${Title}. ${Genre}. ${Description}. ${Year}`;

        try {
            await index.upsert({
                id: Title,
                data: text,
                metadata: {
                    title: Title,
                    year: Number(Year),
                    description: Description,
                    genre: Genre,
                    director: Director,
                    actors: Actors,
                    rating: Number(Rating),
                    votes: Number(Votes),
                    revenue: Number(Revenue),
                    metascore: Number(Metascore),
                } as MovieMetadata
            });

        } catch (error) {
            spinner.fail(`Error indexing movie ${Title}`);
            console.error(error);
        }

    }
    spinner.succeed(`Success: All Movies Indexed!`);
};

indexMovieData();