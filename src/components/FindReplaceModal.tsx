'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';

export default function FindReplaceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Get campaignId from the URL, if available
  const params = useParams();
  const campaignId = params.id as string;
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findText || !replaceText || !campaignId) {
      alert('Please fill in all fields and ensure you are on a campaign page.');
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/replace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ find: findText, replace: replaceText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      alert(`Success! Replaced ${data.count} instances of "${findText}".`);
      setIsOpen(false);
      setFindText('');
      setReplaceText('');

      // Refresh the page to show the new text
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : 'An error occurred.'
        }`
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* --- 1. The Trigger Button --- */}
      {/* We will move this to a global header later */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Find & Replace"
      >
        <FaSearch size={20} />
      </button>

      {/* --- 2. The Modal Overlay & Content --- */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Mass-Edit Spellings</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="find"
                  className="block text-sm font-medium text-gray-300"
                >
                  Find Text
                </label>
                <input
                  type="text"
                  id="find"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="e.g., Lita"
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="replace"
                  className="block text-sm font-medium text-gray-300"
                >
                  Replace with
                </label>
                <input
                  type="text"
                  id="replace"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="e.g., Lidda"
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <p className="text-sm text-gray-400">
                This will search and replace text across all descriptions and
                recaps for the
                <strong className="text-white">
                  {' '}
                  {campaignId ? 'current campaign' : '...'}
                </strong>
                .
              </p>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSearching || !findText || !replaceText || !campaignId
                  }
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-500"
                >
                  {isSearching ? 'Replacing...' : 'Run Replacement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
