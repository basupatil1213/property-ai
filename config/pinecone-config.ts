import { Pinecone } from '@pinecone-database/pinecone';

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
});

export const index_name = 'property-ai-index-two';
export const timeout = 60000;