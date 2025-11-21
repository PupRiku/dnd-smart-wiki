import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function ItemViewPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const params = await paramsPromise;

  const item = await prisma.item.findUnique({
    where: { id: params.itemId },
  });

  if (!item) notFound();

  // Color code rarity (simple version)
  const rarityColor = item.rarity?.toLowerCase().includes('legendary')
    ? 'text-orange-400'
    : item.rarity?.toLowerCase().includes('very rare')
    ? 'text-purple-400'
    : item.rarity?.toLowerCase().includes('rare')
    ? 'text-blue-400'
    : item.rarity?.toLowerCase().includes('uncommon')
    ? 'text-green-400'
    : 'text-gray-400';

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link
            href={`/campaign/${params.id}/items`}
            className="text-blue-400 hover:text-blue-300"
          >
            &larr; Back to List
          </Link>
          <Link
            href={`/campaign/${params.id}/items/${item.id}/edit`}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Edit Item
          </Link>
        </div>

        <div className="border-b border-gray-700 pb-6 mb-6">
          <h1 className="text-5xl font-bold text-white mb-2">{item.name}</h1>
          <div className="text-xl flex gap-4 items-center">
            <span className="text-gray-300 capitalize">
              {item.type || 'Item'}
            </span>
            {item.rarity && (
              <span className={`font-semibold capitalize ${rarityColor}`}>
                • {item.rarity}
              </span>
            )}
          </div>
        </div>

        <article className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
          {item.description || 'No description available.'}
        </article>
      </div>
    </main>
  );
}
