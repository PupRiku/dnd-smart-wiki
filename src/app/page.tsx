import Link from 'next/link';
import prisma from '@/lib/prisma'; // Import our database client
import SessionForm from '@/components/SessionForm'; // Import our new form

export default async function Home() {
  // 1. Fetch data directly from the database!
  // This is a Server Component, so we can do this.
  const campaigns = await prisma.campaign.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-12 text-center">
          D&D Smart Wiki & Storybook
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* --- LEFT COLUMN: CAMPAIGN LIST --- */}
          <div className="md:col-span-1">
            <h2 className="text-3xl font-bold mb-6">Your Campaigns</h2>
            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <p className="text-gray-400">
                  No campaigns yet. Create one to get started!
                </p>
              ) : (
                campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="block p-4 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
                  >
                    {/* This will be a link later */}
                    <h3 className="text-xl font-semibold text-white">
                      {campaign.name}
                    </h3>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: THE FORM --- */}
          <div className="md:col-span-2">
            {/* 2. We render the Client Component form here */}
            <SessionForm />
          </div>
        </div>
      </div>
    </main>
  );
}
