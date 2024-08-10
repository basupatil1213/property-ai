'use client'
import React, { useState } from 'react'

const AdminPage = () => {
  const [file, setFile] = useState(null)

  const handleFileChange = (event:any) => {
    setFile(event.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    // Logic to upload file to Pinecone database using OpenAI embeddings
  }

  const handleUpsert = async () => {
    
    // Logic to call /api/admin/dataset/upsert
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <input 
        type="file" 
        onChange={handleFileChange} 
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <button 
        onClick={handleUpload} 
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Upload Document
      </button>
      <button 
        onClick={handleUpsert} 
        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
      >
        Upsert Dataset
      </button>
    </div>
  )
}

export default AdminPage