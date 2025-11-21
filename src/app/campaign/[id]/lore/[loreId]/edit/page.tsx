'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { type Lore } from '@prisma/client';

type LoreFormData = Partial<Lore>;

export default function EditLorePage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const loreId = params.loreId as string;

  const [formData, setFormData] = useState<LoreFormData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (loreId) {
      setIsLoading(true);
      fetch(`/api/lore/${loreId}`)
        .then((res) => res.json())
        .then((data: Lore) => {
          setFormData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [loreId]);

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
      const response = await fetch(`/api/lore/${loreId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save changes');
      }

      alert('Changes saved!');
      router.push(`/campaign/${campaignId}/lore/${loreId}`);
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
  if (!formData.title) return <div className="p-24 text-center">Not Found</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <Link
          href={`/campaign/${campaignId}/lore/${loreId}`}
          className="text-blue-400 hover:text-blue-300"
        >
          &larr; Cancel & Back to View
        </Link>
        <h1 className="text-5xl font-bold my-8">Edit: {formData.title}</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
            />
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
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Tag
              </label>
              <input
                type="text"
                name="tag"
                placeholder="e.g., In-Game, Meta"
                value={formData.tag || ''}
                onChange={handleChange}
                className="mt-1 w-full rounded-md bg-gray-800 border-gray-600 p-3"
              />
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
