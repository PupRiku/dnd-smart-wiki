import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const campaignId = params.id;

    if (!campaignId)
      return NextResponse.json(
        { error: 'Campaign ID required' },
        { status: 400 }
      );

    const [characters, locations] = await Promise.all([
      prisma.character.findMany({
        where: { campaignId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.location.findMany({
        where: { campaignId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({ characters, locations });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error fetching lists' },
      { status: 500 }
    );
  }
}
