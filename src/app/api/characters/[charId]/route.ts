import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This function handles GET requests to /api/characters/[charId]
export async function GET(
  request: Request,
  // 1. We must treat 'params' as a Promise
  { params: paramsPromise }: { params: Promise<{ charId: string }> }
) {
  try {
    // 2. Await the promise to get the actual params
    const params = await paramsPromise;
    const charId = params.charId;

    if (!charId) {
      return NextResponse.json(
        { error: 'Character ID is required' },
        { status: 400 }
      );
    }

    // 3. Find the character in the database
    const character = await prisma.character.findUnique({
      where: {
        id: charId,
      },
    });

    // 4. If not found, return 404
    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    // 5. If found, return the character data
    return NextResponse.json(character);
  } catch (error) {
    console.error('--- API GET CHARACTER ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred fetching character data' },
      { status: 500 }
    );
  }
}
