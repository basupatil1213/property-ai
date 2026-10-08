# Property AI — Real Estate RAG Assistant

A Next.js "Real Estate AI Assistant" that answers questions about property listings using retrieval-augmented generation (RAG). Listing data from a CSV file is embedded with OpenAI and stored in Pinecone; questions are embedded, matched against the index, and answered by an LLM through a LangChain QA chain.

## How it works

1. **Ingest** — `POST /api/admin/dataset/upsert` reads a CSV of property data, turns each row into a document, splits it with LangChain's `RecursiveCharacterTextSplitter`, creates OpenAI embeddings, and upserts them in batches into a Pinecone serverless index (`property-ai-index-two`, 1536-dim, cosine), creating the index if needed.
2. **Ask** — `POST /api/chat` with `{ "query": "..." }` embeds the question, retrieves the top 10 matching chunks from Pinecone, and passes them to a LangChain `loadQAStuffChain` with an OpenAI LLM to generate the answer.
3. **UI** — the home page has a query box ("Ask AI") that calls `/api/chat` and shows the answer.

## Tech stack

Next.js (App Router), TypeScript, LangChain (JS), OpenAI (embeddings + LLM), Pinecone, Tailwind CSS, Material UI

## Project structure

```
app/api/admin/dataset/upsert/route.ts  # CSV -> embeddings -> Pinecone
app/api/chat/route.ts                  # question -> retrieval -> LLM answer
Utils/pineconeUtils.ts                 # index creation, upsert and query helpers
config/                                # OpenAI and Pinecone clients
```

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local`:

   ```bash
   OPENAI_API_KEY=...
   PINECONE_API_KEY=...
   ```

3. Point the upsert route at your data: the CSV path is currently hard-coded as `filePath` in `app/api/admin/dataset/upsert/route.ts`, so change it to your own CSV file.

4. Start the dev server, then build the index once and start asking questions:

   ```bash
   npm run dev
   curl -X POST http://localhost:3000/api/admin/dataset/upsert
   ```

   Open http://localhost:3000 and use the "Ask AI" box.
