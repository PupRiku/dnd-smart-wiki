'use client';

import { useState } from 'react';

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignName) {
      alert('Please enter a campaign name.');
      return;
    }
    if (!transcript) {
      alert('Please paste in your transcript.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript, campaignName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Browser console
      console.log('API response:', data);
      alert('Success! Check your VSCode terminal.');
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">D&D Smart Wiki</h1>
      <p className="text-lg mb-6">
        First, name your campaign. Then, paste your session transcript below.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="mb-4">
          <label htmlFor="campaign" className="block text-sm font-medium mb-2">
            Campaign Name
          </label>
          <input
            type="text"
            id="campaign"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g., Reign of Vecna"
            className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white"
            disabled={isLoading}
          />
        </div>
        <div>
          <label
            htmlFor="transcript"
            className="block text-sm font-medium mb-2"
          >
            Session Transcript
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your full session transcript here..."
            rows={15}
            className="w-full p-4 border border-gray-600 rounded-md bg-gray-800 text-white"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !campaignName || !transcript}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md disabled:bg-gray-500"
        >
          {isLoading ? 'Generating...' : 'Generate Wiki'}
        </button>
      </form>
    </main>
  );
}
