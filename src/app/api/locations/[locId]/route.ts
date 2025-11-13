import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This function handles GET requests to /api/locations/[locId]
export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ locId: string }> }
) {
  try {
    const params = await paramsPromise;
    const locId = params.locId;

    if (!locId) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }

    const location = await prisma.location.findUnique({
      where: {
        id: locId,
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('--- API GET LOCATION ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred fetching location data' },
      { status: 500 }
    );
  }
}

// This function handles PATCH requests to /api/locations/[locId]
export async function PATCH(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ locId: string }> }
) {
  try {
    const params = await paramsPromise;
    const locId = params.locId;
    const body = await request.json();

    // Get only the fields we want to update
    const { name, description, type, foundingYear } = body;

    const updatedLocation = await prisma.location.update({
      where: {
        id: locId,
      },
      data: {
        name,
        description,
        type,
        foundingYear,
      },
    });

    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error('--- API PATCH LOCATION ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred saving the location' },
      { status: 500 }
    );
  }
}
