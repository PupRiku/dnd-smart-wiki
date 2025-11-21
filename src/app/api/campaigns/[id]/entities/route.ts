import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const campaignId = params.id;

    // Get the 'type' from the URL query string (e.g., ?type=Character)
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!campaignId || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Determine the model delegate dynamically
    // @ts-ignore
    const modelDelegate = prisma[type.toLowerCase()];

    if (!modelDelegate) {
      return NextResponse.json(
        { error: `Invalid type: ${type}` },
        { status: 400 }
      );
    }

    // Determine which field to select ('name' for most, 'title' for Lore)
    const nameField = type === 'Lore' ? 'title' : 'name';

    // Fetch only the names/titles to keep it fast
    const entities = await modelDelegate.findMany({
      where: { campaignId },
      select: { [nameField]: true },
      orderBy: { [nameField]: 'asc' },
    });

    // Flatten the result to a simple array of strings
    // @ts-ignore
    const names = entities.map((e) => e[nameField]);

    return NextResponse.json(names);
  } catch (error) {
    console.error('--- API GET ENTITIES ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred fetching entities' },
      { status: 500 }
    );
  }
}
