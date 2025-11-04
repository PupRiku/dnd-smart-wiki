import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

// This is the standard, stable way to define the page
export default async function CampaignPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Await the params promise to get the actual params object
  const params = await paramsPromise;

  // 2. Fetch the specific campaign and its related sessions
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: params.id,
    },
    include: {
      sessions: {
        orderBy: {
          sessionNumber: 'asc', // Order sessions 1, 2, 3...
        },
      },
    },
  });

  // 2. If no campaign is found, show a 404 page
  if (!campaign) {
    notFound();
  }

  // 3. Render the page
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-5xl">
        <Link
          href="/"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          &larr; Back to All Campaigns
        </Link>

        <h1 className="text-5xl font-bold my-8">{campaign.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* --- LEFT COLUMN: NAVIGATION --- */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-semibold mb-4">Wiki Menu</h2>
            <nav className="space-y-2">
              <Link
                href={`/campaign/${campaign.id}/characters`}
                className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Characters
              </Link>
              <Link
                href={`/campaign/${campaign.id}/locations`}
                className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Locations
              </Link>
              <Link
                href={`/campaign/${campaign.id}/organizations`}
                className="block p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Organizations
              </Link>
            </nav>
          </div>

          {/* --- RIGHT COLUMN: SESSIONS (STORYBOOK) --- */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">
              Storybook (Sessions)
            </h2>
            <div className="space-y-4">
              {campaign.sessions.length === 0 ? (
                <p className="text-gray-400">No sessions yet.</p>
              ) : (
                campaign.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-gray-800 rounded-lg shadow"
                  >
                    <h3 className="text-xl font-semibold text-white">
                      Session {session.sessionNumber}: {session.title}
                    </h3>
                    {session.chapterTitle && (
                      <p className="text-lg text-blue-300 mt-1 italic">
                        {session.chapterTitle}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
