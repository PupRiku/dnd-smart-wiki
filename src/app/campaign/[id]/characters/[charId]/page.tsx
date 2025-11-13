'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Character } from '@prisma/client';

// Define a type for our form data
// We use Partial<Character> because not all fields are on the form
type CharacterFormData = Partial<Character>;

export default function EditCharacterPage() {
  const params = useParams();
  const router = useRouter(); // We'll use this to navigate
  const campaignId = params.id as string;
  const charId = params.charId as string;

  // This state will hold the form data as you type
  const [formData, setFormData] = useState<CharacterFormData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the character data when the page loads
  useEffect(() => {
    if (charId) {
      setIsLoading(true);
      fetch(`/api/characters/${charId}`)
        .then((res) => res.json())
        .then((data: Character) => {
          setFormData(data); // <-- Load fetched data into our form state
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [charId]);

  // --- 1. NEW: Handle form input changes ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Update the form state when the user types
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- 2. NEW: Handle the form submission ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/characters/${charId}`, {
        method: 'PATCH', // Use the PATCH method to update
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Send the new data
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save changes');
      }

      // Success!
      alert('Changes saved!');
      // Navigate back to the character list
      router.push(`/campaign/${campaignId}/characters`);
      router.refresh(); // Tell Next.js to refetch the list
    } catch (error) {
      console.error(error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : 'An error occurred.'
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <p>Loading character data...</p>
      </main>
    );
  }

  if (!formData.name) {
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

  // --- 3. UPDATED FORM ---
  // We now use `value` and `onChange` to make this a "controlled" form
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <Link
          href={`/campaign/${campaignId}/characters`}
          className="text-blue-400 hover:text-blue-300"
        >
          &larr; Back to Characters
        </Link>
        <h1 className="text-5xl font-bold my-8">Edit: {formData.name}</h1>

        {/* --- FORM CONTAINER --- */}
        <form className="space-y-6" onSubmit={handleSubmit}>
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
                name="name" // Add name attribute
                value={formData.name ?? ''}
                onChange={handleChange}
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
                name="type" // Add name attribute
                value={formData.type ?? ''}
                onChange={handleChange}
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
              name="description" // Add name attribute
              rows={10}
              value={formData.description ?? ''}
              onChange={handleChange}
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
                name="species" // Add name attribute
                value={formData.species ?? ''}
                onChange={handleChange}
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
                name="class" // Add name attribute
                value={formData.class ?? ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* --- Level, HP, AC, Status --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label
                htmlFor="level"
                className="block text-sm font-medium text-gray-300"
              >
                Level
              </label>
              <input
                type="number"
                id="level"
                name="level"
                value={formData.level ?? ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="hp"
                className="block text-sm font-medium text-gray-300"
              >
                HP
              </label>
              <input
                type="number"
                id="hp"
                name="hp"
                value={formData.hp ?? ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="ac"
                className="block text-sm font-medium text-gray-300"
              >
                AC
              </label>
              <input
                type="number"
                id="ac"
                name="ac"
                value={formData.ac ?? ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-300"
              >
                Status
              </label>
              <input
                type="text"
                id="status"
                name="status"
                value={formData.status ?? ''}
                onChange={handleChange}
                placeholder="e.g., Alive, Deceased"
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* --- Stat Block --- */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Ability Scores
            </label>
            <div className="mt-1 grid grid-cols-3 md:grid-cols-6 gap-4">
              {/* STR */}
              <div>
                <input
                  type="number"
                  id="strength"
                  name="strength"
                  value={formData.strength ?? ''}
                  onChange={handleChange}
                  placeholder="STR"
                  className="block w-full rounded-md border-gray-600 bg-gray-800 p-3 text-center shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* DEX */}
              <div>
                <input
                  type="number"
                  id="dexterity"
                  name="dexterity"
                  value={formData.dexterity ?? ''}
                  onChange={handleChange}
                  placeholder="DEX"
                  className="block w-full rounded-md border-gray-600 bg-gray-800 p-3 text-center shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* CON */}
              <div>
                <input
                  type="number"
                  id="constitution"
                  name="constitution"
                  value={formData.constitution ?? ''}
                  onChange={handleChange}
                  placeholder="CON"
                  className="block w-full rounded-md border-gray-600 bg-gray-800 p-3 text-center shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* INT */}
              <div>
                <input
                  type="number"
                  id="intelligence"
                  name="intelligence"
                  value={formData.intelligence ?? ''}
                  onChange={handleChange}
                  placeholder="INT"
                  className="block w-full rounded-md border-gray-600 bg-gray-800 p-3 text-center shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* WIS */}
              <div>
                <input
                  type="number"
                  id="wisdom"
                  name="wisdom"
                  value={formData.wisdom ?? ''}
                  onChange={handleChange}
                  placeholder="WIS"
                  className="block w-full rounded-md border-gray-600 bg-gray-800 p-3 text-center shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {/* CHA */}
              <div>
                <input
                  type="number"
                  id="charisma"
                  name="charisma"
                  value={formData.charisma ?? ''}
                  onChange={handleChange}
                  placeholder="CHA"
                  className="block w-full rounded-md border-gray-600 bg-gray-800 p-3 text-center shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* --- Form Actions --- */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-500"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
