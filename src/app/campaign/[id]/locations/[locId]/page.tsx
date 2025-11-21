import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function LocationViewPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; locId: string }>;
}) {
  const params = await paramsPromise;

  const location = await prisma.location.findUnique({
    where: { id: params.locId },
  });

  if (!location) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href={`/campaign/${params.id}/locations`}
            className="text-blue-400 hover:text-blue-300"
          >
            &larr; Back to List
          </Link>
          <Link
            href={`/campaign/${params.id}/locations/${location.id}/edit`}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Edit Location
          </Link>
        </div>

        {/* Title & Details */}
        <div className="border-b border-gray-700 pb-6 mb-6">
          <h1 className="text-5xl font-bold text-white mb-2">
            {location.name}
          </h1>
          <div className="text-xl text-purple-300 flex gap-4">
            <span className="capitalize">{location.type || 'Location'}</span>
            {location.foundingYear && (
              <span>• Founded: {location.foundingYear}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <article className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
          {location.description || 'No description available.'}
        </article>
      </div>
    </main>
  );
}
