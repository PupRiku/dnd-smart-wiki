import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch organization WITH relations
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
      where: { id: orgId },
      include: {
        leader: true, // Include full Leader object
        headquarters: true, // Include full HQ object
        members: true, // Include array of Member objects
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
      { error: 'An error occurred fetching data' },
      { status: 500 }
    );
  }
}

// PATCH: Update organization AND relations
export async function PATCH(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ orgId: string }> }
) {
  try {
    const params = await paramsPromise;
    const orgId = params.orgId;
    const body = await request.json();

    // Destructure fields, including the new relational IDs
    const {
      name,
      description,
      type,
      status,
      founding,
      leaderId, // String or null
      headquartersId, // String or null
      memberIds, // Array of strings
    } = body;

    // Construct the update data dynamically
    const updateData: any = {
      name,
      description,
      type,
      status,
      founding,
    };

    // Handle Leader Relation
    if (leaderId === null) {
      updateData.leader = { disconnect: true }; // Remove leader
    } else if (leaderId) {
      updateData.leader = { connect: { id: leaderId } }; // Set leader
    }

    // Handle Headquarters Relation
    if (headquartersId === null) {
      updateData.headquarters = { disconnect: true };
    } else if (headquartersId) {
      updateData.headquarters = { connect: { id: headquartersId } };
    }

    // Handle Members Relation
    if (Array.isArray(memberIds)) {
      // 'set' replaces the entire list of members with the new list
      updateData.members = {
        set: memberIds.map((id: string) => ({ id })),
      };
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: orgId },
      data: updateData,
    });

    return NextResponse.json(updatedOrganization);
  } catch (error) {
    console.error('--- API PATCH ORGANIZATION ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred saving data' },
      { status: 500 }
    );
  }
}
