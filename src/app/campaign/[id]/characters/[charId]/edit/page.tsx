'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Character } from '@prisma/client';

type CharacterFormData = Partial<Character>;

export default function EditCharacterPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const charId = params.charId as string;

  const [formData, setFormData] = useState<CharacterFormData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (charId) {
      setIsLoading(true);
      fetch(`/api/characters/${charId}`)
        .then((res) => res.json())
        .then((data: Character) => {
          setFormData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [charId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/characters/${charId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save changes');
      }

      alert('Changes saved!');
      // Redirect to the VIEW page, not the list
      router.push(`/campaign/${campaignId}/characters/${charId}`);
      router.refresh();
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

  if (isLoading) return <div className="p-24 text-center">Loading...</div>;
  if (!formData.name) return <div className="p-24 text-center">Not Found</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        {/* Back link goes to the View page */}
        <Link
          href={`/campaign/${campaignId}/characters/${charId}`}
          className="text-blue-400 hover:text-blue-300"
        >
          &larr; Cancel & Back to View
        </Link>
        <h1 className="text-5xl font-bold my-8">Edit: {formData.name}</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* ... (The rest of your form inputs remain exactly the same) ... */}
          {/* Simply copy the form content from your previous file if you made custom changes, 
              or use the standard inputs we defined previously. I'll keep it concise here. */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Type
              </label>
              <input
                type="text"
                name="type"
                value={formData.type || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              rows={10}
              value={formData.description || ''}
              onChange={handleChange}
              className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Species
              </label>
              <input
                type="text"
                name="species"
                value={formData.species || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Class
              </label>
              <input
                type="text"
                name="class"
                value={formData.class || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Level
              </label>
              <input
                type="number"
                name="level"
                value={formData.level || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                HP
              </label>
              <input
                type="number"
                name="hp"
                value={formData.hp || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                AC
              </label>
              <input
                type="number"
                name="ac"
                value={formData.ac || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Status
              </label>
              <input
                type="text"
                name="status"
                value={formData.status || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
            </div>
          </div>

          {/* Ability Scores */}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Ability Scores
            </label>
            <div className="mt-1 grid grid-cols-3 md:grid-cols-6 gap-4">
              {/* Simple loop for stats to save space in this example */}
              {[
                'strength',
                'dexterity',
                'constitution',
                'intelligence',
                'wisdom',
                'charisma',
              ].map((stat) => (
                <div key={stat}>
                  <input
                    type="number"
                    name={stat}
                    value={(formData as any)[stat] || ''}
                    onChange={handleChange}
                    placeholder={stat.substring(0, 3).toUpperCase()}
                    className="w-full rounded-md bg-gray-800 border-gray-600 p-3 text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-6 py-2 font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
