'use client'; // This is a Client Component

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Lore } from '@prisma/client'; // Import the Lore type

// Define a type for our form data
type LoreFormData = Partial<Lore>;

export default function EditLorePage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const loreId = params.loreId as string;

  const [formData, setFormData] = useState<LoreFormData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the lore data when the page loads
  useEffect(() => {
    if (loreId) {
      setIsLoading(true);
      fetch(`/api/lore/${loreId}`) // We will create this API route next
        .then((res) => res.json())
        .then((data: Lore) => {
          setFormData(data); // Load fetched data into our form state
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [loreId]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle the form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/lore/${loreId}`, {
        // We will create this API route next
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save changes');
      }

      alert('Changes saved!');
      router.push(`/campaign/${campaignId}/lore`);
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

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <p>Loading lore data...</p>
      </main>
    );
  }

  if (!formData.title) {
    return (
      <main className="flex min-h-screen flex-col items-center p-24">
        <h1 className="text-3xl font-bold">Lore entry not found.</h1>
        <Link
          href={`/campaign/${campaignId}/lore`}
          className="mt-4 text-blue-400 hover:text-blue-300"
        >
          &larr; Back to Lore
        </Link>
      </main>
    );
  }

  // Render the form
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <Link
          href={`/campaign/${campaignId}/lore`}
          className="text-blue-400 hover:text-blue-300"
        >
          &larr; Back to Lore
        </Link>
        <h1 className="text-5xl font-bold my-8">Edit: {formData.title}</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* --- Title --- */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
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
              name="description"
              rows={10}
              value={formData.description ?? ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* --- Type & Tag --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-300"
              >
                Type
              </label>
              <input
                type="text"
                id="type"
                name="type"
                placeholder="e.g., Historical Event, Concept"
                value={formData.type ?? ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="tag"
                className="block text-sm font-medium text-gray-300"
              >
                Tag
              </label>
              <input
                type="text"
                id="tag"
                name="tag"
                placeholder="e.g., In-Game, Meta"
                value={formData.tag ?? ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
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
