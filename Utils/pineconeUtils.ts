import { pc } from "@/config/pinecone-config";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAI } from "@langchain/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { IndexList } from "@pinecone-database/pinecone";

export const createPineconeIndex = async () => {

    // check if the index already exists
    const indexes: IndexList = await pc.listIndexes();
    const indexExists = indexes.indexes?.some(index => index.name === 'property-ai-index-two');

    if (indexExists) {
        console.log('Index already exists');
        return;
    }


    // Create a new Pinecone index
    await pc.createIndex({
        name: 'property-ai-index-two',
        dimension: 1536, // Replace with your model dimensions
        metric: 'cosine', // Replace with your model metric
        spec: {
            serverless: {
                cloud: 'aws',
                region: 'us-east-1'
            }
        }
    });
}

const chunks = (array: any, batchSize = 200) => {
    const chunks = [];

    for (let i = 0; i < array.length; i += batchSize) {
        chunks.push(array.slice(i, i + batchSize));
    }

    return chunks;
};

export const updatePinecone = async (
    client: any,
    index_name: string,
    docs: any
) => {
    const index = client.Index(index_name);
    console.log(`Updating index ${index_name} with ${docs.length} documents`);

    const batch: any = []; // Initialize the batch outside the loop

    for (const doc of docs) {
        console.log(`Processing document ${doc.id}`);
        
        // Check for required fields
        if (!doc || !doc.id || !doc.metadata || !doc.pageContent) {
            console.error(`Invalid document structure: ${JSON.stringify(doc.pageContent)} ${JSON.stringify(doc.metadata)}, id: ${doc.id}`);
            continue; // Skip invalid documents
        }

        console.log(`Adding document ${JSON.stringify(doc)}`);
        const textpath = doc.metadata.source;
        const text = doc.pageContent;

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
        });
        const chunks = await splitter.createDocuments([text]);
        console.log(`Splitting document ${doc.id} into ${chunks.length} chunks`);

        const embeddings_array = await new OpenAIEmbeddings().embedDocuments(
            chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
        );
        console.log(`Embedding document ${doc.id}`);

        console.log(`chunks: ${JSON.stringify(chunks)}`);
        for (let i = 0; i < chunks.length; i++) {
            console.log(`Processing chunk ${i}`);
            
            const chunk = chunks[i];
            const vector = {
                id: `${textpath}_${Math.round(Math.random() * 1000000)}`,
                values: embeddings_array[i],
                metadata: {
                    ...chunk.metadata,
                    loc: JSON.stringify(chunk.metadata.source),
                    pageContent: chunk.pageContent,
                    txtPath: textpath,
                },
            };

            // Log the vector for debugging
            console.log(`Vector to upsert: ${JSON.stringify(vector)}`);
            // if (!vector.values) {
            //     console.error(`Missing values for vector: ${JSON.stringify(vector)}`);
            //     continue; // Skip if values are missing
            // }
            console.log(`Adding vector ${JSON.stringify(vector)}`);
            batch.push(vector); // Add to batch
        }
    }

    // Upsert the entire batch at once
    if (batch.length > 0) {
        try {
            const resp = await index.upsert(batch);
            console.log(`response: ${JSON.stringify(resp)}`);
            console.log(`Upserted batch of size ${batch.length}`);
        } catch (error) {
            console.error(`Failed to upsert batch: ${error}`);
        }
    }
    else{
        console.log(`No vectors to upsert`);
    }

    console.log(`Finished updating index ${index_name}`);
};

export const queryPinconeVectorStoreandLLM = async (
    client:any,
    index_name: string,
    question: string
) => {
    console.log(`Querying index ${index_name} with question: ${question}`);
    const index = client.Index(index_name);

    // Check if question is a string
    if (typeof question !== 'string') {
        console.error(`Invalid question type: ${JSON.stringify(question)} & typeof: ${typeof question}`);
        return null; // Early return if question is not a string
    }

    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);

    const queryResponse = await index.query({
            vector: queryEmbedding,
            topK: 1,
            includeMetadata: true,
            includeValues: true,
    });

    console.log(` Response: ${JSON.stringify(queryResponse.matches)} & typeof: ${typeof queryResponse}`);
    console.log(`found ${queryResponse.matches.length} matches`);

    if (queryResponse.matches.length) {
        const llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const chain = loadQAStuffChain(llm);

        const concatenatedPages = queryResponse.matches
            .map((match:any) => match.metadata.pageContent)
            .join(" ");

        const result = await chain.call({
            input_documents: [new Document({ pageContent: concatenatedPages })],
            question: question,
        });

        return result;
    } else {
        console.log(`No matches found`);

        return null;
    }
};