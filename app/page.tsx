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
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-200 to-indigo-600 text-gray-800">
      <header className="w-full max-w-4xl mx-auto text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 animate-fadeIn">Real Estate AI Assistant</h1>
        <p className="text-lg text-gray-600 mt-2 animate-fadeIn animation-delay-2">Find the perfect property with ease</p>
      </header>
      
      <section className="w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-md shadow-lg rounded-lg p-8">
        <div className="relative h-64 w-full rounded-lg overflow-hidden mb-6">
          <Image 
            src="/real-estate.jpg" 
            alt="Real Estate"
            layout="fill"
            objectFit="cover"
          />
        </div>

        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="w-full p-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
          placeholder="Enter your query..." 
        />
        <button 
          onClick={sendQuery} 
          className="w-full mt-4 p-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Ask AI
        </button>
        
        {loading && (
          <div className="mt-4 flex justify-center">
            <div className="loader"></div>
          </div>
        )}
        
        {result && (
          <div className="mt-6 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg p-6">
            <p className="text-gray-800">{result}</p>
          </div>
        )}
      </section>

    </main>
  );
}
