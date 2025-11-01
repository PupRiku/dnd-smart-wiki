import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Log to the server terminal, not the browser console
    console.log('--- API ROUTE RECEIVED ---');
    console.log(transcript);
    console.log('--------------------------');

    // --- AI LOGIC & DATABASE SAVING WILL GO HERE ---
    // For now, just send back a success message
    
    return NextResponse.json({
      message: 'Transcript received successfully!',
      // We'll eventually send back the parsed data here
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred processing the request' },
      { status: 500 }
    );
  }
}