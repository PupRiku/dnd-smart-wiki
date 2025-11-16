import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

// Use the 'await' pattern
export default async function OrganizationsPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Await the params promise to get the campaign ID
  const params = await paramsPromise;

  // 2. Fetch the campaign and its related organizations
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: params.id,
    },
    include: {
      organizations: {
        // Ask Prisma to include all organizations
        orderBy: {
          name: 'asc', // Sort them alphabetically
        },
      },
    },
  });

  // 3. If no campaign is found, show a 404 page
  if (!campaign) {
    notFound();
  }

  // 4. Render the page
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-5xl">
        {/* --- Header & Back Link --- */}
        <Link
          href={`/campaign/${campaign.id}`} // Link back to the main campaign page
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          &larr; Back to {campaign.name}
        </Link>
        <h1 className="text-5xl font-bold my-8">
          {campaign.name}: Organizations
        </h1>

        {/* --- Organization List --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaign.organizations.length === 0 ? (
            <p className="text-gray-400">
              No organizations found for this campaign yet.
            </p>
          ) : (
            campaign.organizations.map((org) => (
              <Link
                key={org.id}
                href={`/campaign/${params.id}/organizations/${org.id}`}
                className="block p-6 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {org.name}
                </h3>
                {org.type && (
                  <p className="text-gray-300 text-sm mb-1 capitalize">
                    {org.type}
                  </p>
                )}
                <p className="text-gray-400 mt-4 line-clamp-4">
                  {org.description}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
