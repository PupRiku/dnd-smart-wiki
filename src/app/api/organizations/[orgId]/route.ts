import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This function handles GET requests to /api/organizations/[orgId]
export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ orgId: string }> }
) {
  try {
    const params = await paramsPromise;
    const orgId = params.orgId;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: orgId,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('--- API GET ORGANIZATION ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred fetching organization data' },
      { status: 500 }
    );
  }
}

// This function handles PATCH requests to /api/organizations/[orgId]
export async function PATCH(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ orgId: string }> }
) {
  try {
    const params = await paramsPromise;
    const orgId = params.orgId;
    const body = await request.json();

    // Get only the fields we want to update
    const { name, description, type, status, founding } = body;

    const updatedOrganization = await prisma.organization.update({
      where: {
        id: orgId,
      },
      data: {
        name,
        description,
        type,
        status,
        founding,
      },
    });

    return NextResponse.json(updatedOrganization);
  } catch (error) {
    console.error('--- API PATCH ORGANIZATION ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred saving the organization' },
      { status: 500 }
    );
  }
}
