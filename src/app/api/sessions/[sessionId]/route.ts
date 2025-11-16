import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This function handles GET requests to /api/sessions/[sessionId]
export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await paramsPromise;
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await prisma.sessionSummary.findUnique({
      where: {
        id: sessionId,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('--- API GET SESSION ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred fetching session data' },
      { status: 500 }
    );
  }
}

// This function handles PATCH requests to /api/sessions/[sessionId]
export async function PATCH(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const params = await paramsPromise;
    const sessionId = params.sessionId;
    const body = await request.json();

    // Get only the fields we want to update
    const { title, chapterTitle, recap, outline, notes } = body;

    const updatedSession = await prisma.sessionSummary.update({
      where: {
        id: sessionId,
      },
      data: {
        title,
        chapterTitle,
        recap,
        outline,
        notes,
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('--- API PATCH SESSION ERROR ---', error);
    return NextResponse.json(
      { error: 'An error occurred saving the session' },
      { status: 500 }
    );
  }
}
