'use client';

import { useState, FormEvent } from 'react';

// Define the props our modal will accept
type ScrybeQuillModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    recap: string;
    outline: string;
    quotes: string;
    notes: string;
  }) => void;
  isEnhancing: boolean;
};

export default function ScrybeQuillModal({
  isOpen,
  onClose,
  onSubmit,
  isEnhancing,
}: ScrybeQuillModalProps) {
  // Local state to manage the form inputs
  const [recap, setRecap] = useState('');
  const [outline, setOutline] = useState('');
  const [quotes, setQuotes] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Pass all the data up to the parent page to handle the API call
    onSubmit({ recap, outline, quotes, notes });
  };

  if (!isOpen) return null;

  return (
    // Modal Overlay
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-75">
      {/* Modal Content */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">Import from Scrybe Quill</h2>
        <p className="text-gray-400 mb-6">
          Paste your curated notes below. The AI will use this text to enhance
          and correct the auto-generated Storybook recap and wiki entries.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recap */}
          <div>
            <label
              htmlFor="sq-recap"
              className="block text-sm font-medium text-gray-300"
            >
              Scrybe Quill Recap
            </label>
            <textarea
              id="sq-recap"
              value={recap}
              onChange={(e) => setRecap(e.target.value)}
              rows={5}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Paste the 'Long Recap' text here..."
            />
          </div>

          {/* Outline */}
          <div>
            <label
              htmlFor="sq-outline"
              className="block text-sm font-medium text-gray-300"
            >
              Outline
            </label>
            <textarea
              id="sq-outline"
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              rows={5}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Paste the 'Outline' text here..."
            />
          </div>

          {/* Quotes */}
          <div>
            <label
              htmlFor="sq-quotes"
              className="block text-sm font-medium text-gray-300"
            >
              Quotes
            </label>
            <textarea
              id="sq-quotes"
              value={quotes}
              onChange={(e) => setQuotes(e.target.value)}
              rows={5}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Paste the 'Quotes' text here..."
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="sq-notes"
              className="block text-sm font-medium text-gray-300"
            >
              Notes (NPCs, Items, Locations, etc.)
            </label>
            <textarea
              id="sq-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Paste the 'Notes' text here..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isEnhancing}
              className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEnhancing}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-500"
            >
              {isEnhancing ? 'Enhancing...' : 'Import & Enhance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
