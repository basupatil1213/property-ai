
"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);
   
  async function createIndexAndEmbedding() {
    setLoading(true);
    const response = await fetch("/api/admin/dataset/upsert", {
      method: "POST",
    });
    const data = await response.json();
    console.log(data);
    setLoading(false);
  }

  async function sendQuery() {
    if (!query) return;
    setLoading(true);
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    console.log(`Data: ${JSON.stringify(data)}`);
    setResult(data.data.text);
    setLoading(false);
  }

  return (
    <main className="flex flex-col items-center justify-between p-24 bg-white text-black">
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="p-4 border border-gray-300 rounded-lg text-black" />
      <button onClick={sendQuery} className="p-4 bg-blue-500 text-white rounded-lg">
        Ask AI
      </button>
      {
        loading && <p>Loading...</p>
        }
      {
        result && (
          <div>
            <p className="text-black border-2 p-10">{result}</p>
          </div>
        )
      }
      <button onClick={createIndexAndEmbedding} className="p-4 bg-blue-500 text-white rounded-lg">
        Create Index
      </button>
    </main>
  );
}
