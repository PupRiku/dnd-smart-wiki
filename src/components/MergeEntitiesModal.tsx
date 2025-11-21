'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaObjectGroup } from 'react-icons/fa';

export default function MergeEntitiesModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('Character');
  const [sourceName, setSourceName] = useState('');
  const [targetName, setTargetName] = useState('');
  const [isMerging, setIsMerging] = useState(false);

  // --- NEW STATE FOR DROPDOWN OPTIONS ---
  const [options, setOptions] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const params = useParams();
  const campaignId = params.id as string;
  const router = useRouter();

  // --- NEW EFFECT: Fetch names when Type or Open changes ---
  useEffect(() => {
    if (isOpen && campaignId) {
      setIsLoadingOptions(true);
      // Reset inputs when switching types so you don't merge a Character into a Location
      setSourceName('');
      setTargetName('');

      fetch(`/api/campaigns/${campaignId}/entities?type=${type}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setOptions(data);
          } else {
            console.error('Failed to load options', data);
            setOptions([]);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoadingOptions(false));
    }
  }, [type, isOpen, campaignId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName || !targetName || !campaignId) return;

    if (sourceName === targetName) {
      alert('Source and Target cannot be the same.');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to merge "${sourceName}" INTO "${targetName}"? This cannot be undone and "${sourceName}" will be deleted.`
      )
    ) {
      return;
    }

    setIsMerging(true);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, sourceName, targetName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      alert(`Success! Merged "${sourceName}" into "${targetName}".`);
      setIsOpen(false);
      setSourceName('');
      setTargetName('');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : 'An error occurred.'
        }`
      );
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-16 z-50 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        title="Merge Entities"
      >
        <FaObjectGroup size={20} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-2">Merge Entities</h2>
            <p className="text-sm text-gray-400 mb-6">
              Combine duplicate entries. The <strong>Source</strong> will be
              deleted, and its connections will move to the{' '}
              <strong>Target</strong>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selector */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-300"
                >
                  Entity Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 p-3 shadow-sm text-white focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Character">Character</option>
                  <option value="Location">Location</option>
                  <option value="Organization">Organization</option>
                  <option value="Item">Item</option>
                  <option value="Lore">Lore</option>
                </select>
              </div>

              {/* --- DATALIST DEFINITION --- */}
              {/* This hidden list holds our autocomplete options */}
              <datalist id="entity-options">
                {options.map((opt, idx) => (
                  <option key={idx} value={opt} />
                ))}
              </datalist>

              {/* Source Input with Datalist */}
              <div>
                <label
                  htmlFor="source"
                  className="block text-sm font-medium text-red-400"
                >
                  Source Name (Will be Deleted)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="source"
                    list="entity-options" // Connects to datalist
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder={
                      isLoadingOptions ? 'Loading...' : 'Search or type name...'
                    }
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Target Input with Datalist */}
              <div>
                <label
                  htmlFor="target"
                  className="block text-sm font-medium text-green-400"
                >
                  Target Name (The "Correct" One)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="target"
                    list="entity-options" // Connects to datalist
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder={
                      isLoadingOptions ? 'Loading...' : 'Search or type name...'
                    }
                    className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    autoComplete="off"
                  />
                </div>
              </div>

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
                    isMerging || !sourceName || !targetName || isLoadingOptions
                  }
                  className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 disabled:bg-gray-500"
                >
                  {isMerging ? 'Merging...' : 'Merge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
