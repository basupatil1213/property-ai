import { NextResponse } from "next/server";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { createPineconeIndex, updatePinecone } from "@/Utils/pineconeUtils";
import { index_name, timeout, pc as client } from "@/config/pinecone-config";

export async function POST() {
    const loader = new CSVLoader("/Users/basavarajpatil/Developer/Headstarter Fellowship/weekly-projects/property-ai/documents/Book2.csv");
    let documents;
    try {
        console.log(`Loading documents from ${JSON.stringify(loader)}`);

        documents = await loader.load();

        // Transform CSV rows into structured JSON format
        documents = documents.map((doc, idx) => {
            const content = doc.pageContent.split('\n').reduce((acc:any, line) => {
                const [key, value] = line.split(':');
                acc[key.trim()] = value.trim();
                return acc;
            }, {});
            
            return {
                pageContent: JSON.stringify(content),
                metadata: doc.metadata,
                id : idx + 1
            };
        });

        console.log("Documents loaded and transformed successfully.");
    }
    catch (e) {
        console.error(`Failed to load documents: ${e}`);
        return NextResponse.json({
            status: 500,
            body: "Failed to load documents",
        });
    }

    try {
        await createPineconeIndex();
        await updatePinecone(client, index_name, documents);
    }
    catch (e) {
        console.error(`Failed to update index: ${e}`);
        return NextResponse.json({
            status: 500,
            body: "Failed to update index",
        });
    }

    return NextResponse.json({
        data: "Index updated",
    });
}


// export async function POST() {
//     // const loader = new DirectoryLoader('/Users/basavarajpatil/Developer/Headstarter Fellowship/weekly-projects/property-ai/documents/',
//     //     {
//     //         ".pdf": (path) => new PDFLoader(path),
//     //         ".txt": (path) => new TextLoader(path),
//     //         ".md": (path) => new TextLoader(path),
//     //         ".csv": (path) => new CSVLoader(path),
//     //     },
//     //     false
//     // );
//     const loader = new CSVLoader("/Users/basavarajpatil/Developer/Headstarter Fellowship/weekly-projects/property-ai/documents/Book2.csv");
//     let documents;
//     try {
//         console.log(`Loading documents from ${JSON.stringify(loader)}`);

//         // Debugging log before loading
//         console.log("Starting to load documents...");
//         documents = await loader.load(); // Fixed variable scope
//         console.log("Documents loaded successfully.");

//         documents = documents.map(doc => {
//             const content = doc.pageContent.split('\n').reduce((acc:any, line) => {
//                 const [key, value] = line.split(':');
//                 acc[key.trim()] = value.trim();
//                 return acc;
//             }, {});

//             return {
//                 pageContent: JSON.stringify(content),
//                 metadata: doc.metadata,
//             };
//         });

//         // Validate document structure
//         documents.forEach(doc => {
//             // Log the document to understand its structure
//             console.log("Document loaded:", JSON.stringify(doc));
        
//             // Check if the document structure is valid
//             if (!doc.pageContent || !doc.metadata) {
//                 throw new Error(`Invalid document structure: ${JSON.stringify(doc)}`);
//             }
        
//             // Additional validation on pageContent format
//             if (typeof doc.pageContent !== 'string' || !doc.pageContent.trim()) {
//                 throw new Error(`Unexpected pageContent format: ${JSON.stringify(doc.pageContent)}`);
//             }
//         });

//         console.log(`out of check`);
        
//     }
//     catch (e) {
//         console.error(`Failed to load documents: ${e}`);
//         return NextResponse.json({
//             status: 500,
//             body: "Failed to load documents",
//         });
//         // return NextResponse.error(new Error("Failed to load documents"));
//     }

//     try {
//         await createPineconeIndex();
//         await updatePinecone(client, index_name, documents);
//     }
//     catch (e) {
//         console.error(`upser route: Failed to update index: ${e}`);
//         // return NextResponse.error(new Error("Failed to update index"));
//     }

//     return NextResponse.json({
//         data: "Index updated",
//     });
// }