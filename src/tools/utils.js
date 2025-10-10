import { openai } from "../ai";

// Helper: Calculate cosine similarity between two vectors
// It determines how similar two pieces of text are by comparing their embedding vectors. Higher score = more relevant to your question
export function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
}

//Create embeddings for all chunks
export async function createEmbeddings(chunks) {
    console.log(`Creating embeddings for ${chunks.length} chunks...`);

    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks.map(c => c.text)
    });

    return chunks.map((chunk, i) => ({
        ...chunk,
        embedding: response.data[i].embedding
    }));
}

// Search for most relevant chunks
export async function search(query, documents, topK = 3) {
    // Get query embedding
    const queryResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query
    });

    const queryVector = queryResponse.data[0].embedding;

    // Calculate similarities
    const scored = documents.map(doc => ({
        ...doc,
        score: cosineSimilarity(queryVector, doc.embedding)
    }));

    // Return top K most similar
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
}
