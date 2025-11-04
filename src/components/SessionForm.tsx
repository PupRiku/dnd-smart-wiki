'use client'; // This MUST be a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import the router

export default function SessionForm() {
  const [transcript, setTranscript] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Get the router instance

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

      console.log('API response:', data);
      alert('Success! Database save complete!');

      // Clear the form
      setCampaignName('');
      setTranscript('');

      // Refresh the page to show the new campaign in the list
      router.refresh();
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl bg-gray-900 p-8 rounded-lg shadow-lg"
    >
      <h2 className="text-3xl font-bold mb-6 text-white">Create New Session</h2>
      <p className="text-lg mb-6 text-gray-300">
        Enter a campaign name (or an existing one) and your session transcript.
      </p>

      {/* --- Campaign Name Input --- */}
      <div className="mb-4">
        <label
          htmlFor="campaign"
          className="block text-sm font-medium mb-2 text-gray-200"
        >
          Campaign Name
        </label>
        <input
          type="text"
          id="campaign"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="e.g., Reign of Vecna"
          className="w-full p-3 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* --- Transcript Input --- */}
      <div>
        <label
          htmlFor="transcript"
          className="block text-sm font-medium mb-2 text-gray-200"
        >
          Session Transcript
        </label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your full session transcript here..."
          rows={15}
          className="w-full p-4 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !campaignName || !transcript}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md disabled:bg-gray-500 transition-colors"
      >
        {isLoading ? 'Generating...' : 'Generate Wiki'}
      </button>
    </form>
  );
}
