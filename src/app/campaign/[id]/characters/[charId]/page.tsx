'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { type Character } from '@prisma/client';

export default function EditCharacterPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const charId = params.charId as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the character data when the page loads
  useEffect(() => {
    if (charId) {
      setIsLoading(true);
      fetch(`/api/characters/${charId}`)
        .then((res) => res.json())
        .then((data) => {
          setCharacter(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [charId]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <p>Loading character data...</p>
      </main>
    );
  }

  if (!character) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <h1 className="text-3xl font-bold">Character not found.</h1>
        <Link
          href={`/campaign/${campaignId}/characters`}
          className="mt-4 text-blue-400 hover:text-blue-300"
        >
          &larr; Back to Characters
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <Link
          href={`/campaign/${campaignId}/characters`}
          className="text-blue-400 hover:text-blue-300"
        >
          &larr; Back to Characters
        </Link>
        <h1 className="text-5xl font-bold my-8">Edit: {character.name}</h1>

        {/* --- FORM CONTAINER --- */}
        <form className="space-y-6">
          {/* --- Name & Type --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                defaultValue={character.name}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-300"
              >
                Type (PC, NPC, Other)
              </label>
              <input
                type="text"
                id="type"
                defaultValue={character.type ?? ''}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* --- Description --- */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={10}
              defaultValue={character.description ?? ''}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* --- Species & Class --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="species"
                className="block text-sm font-medium text-gray-300"
              >
                Species
              </label>
              <input
                type="text"
                id="species"
                defaultValue={character.species ?? ''}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-300"
              >
                Class
              </label>
              <input
                type="text"
                id="class"
                defaultValue={character.class ?? ''}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* --- We will add stat blocks here later --- */}

          {/* --- Form Actions --- */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
