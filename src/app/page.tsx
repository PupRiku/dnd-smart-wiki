"use client"

import { useState } from "react";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Submitting transcript:", transcript);

    // --- AI LOGIC WILL GO HERE ---
    // We'll send the 'transcript' to our backend API route.
    
    // For now, just simulate a network request
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Submission complete!");
    // --- END OF AI LOGIC ---

    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">D&D Smart Wiki</h1>
      <p className="text-lg mb-6">
        Paste your session transcript below to generate your wiki pages.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your full session transcript here..."
          rows={15}
          className="w-full p-4 border border-gray-600 rounded-md bg-gray-800 text-white"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md disabled:bg-gray-500"
        >
          {isLoading ? "Generating..." : "Generate Wiki"}
        </button>
      </form>
    </main>
  );
}