import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function LoreViewPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; loreId: string }>;
}) {
  const params = await paramsPromise;

  const lore = await prisma.lore.findUnique({
    where: { id: params.loreId },
  });

  if (!lore) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link
            href={`/campaign/${params.id}/lore`}
            className="text-blue-400 hover:text-blue-300"
          >
            &larr; Back to List
          </Link>
          <Link
            href={`/campaign/${params.id}/lore/${lore.id}/edit`}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Edit Lore
          </Link>
        </div>

        <div className="border-b border-gray-700 pb-6 mb-6">
          <h1 className="text-5xl font-bold text-white mb-2">{lore.title}</h1>
          <div className="text-xl text-purple-300 flex gap-4 items-center">
            {lore.type && <span className="capitalize">{lore.type}</span>}

            {/* New Tag Display */}
            {lore.tag && (
              <span className="px-2 py-0.5 rounded bg-purple-900 text-purple-200 text-sm border border-purple-700">
                {lore.tag}
              </span>
            )}
          </div>
        </div>

        <article className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
          {lore.description || 'No description available.'}
        </article>
      </div>
    </main>
  );
}
