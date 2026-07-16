import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      { 
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000)
      }
    );

    const data = await response.json();
    
    return NextResponse.json({ 
      status: response.status,
      ok: response.ok,
      data: data
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      type: error.name 
    }, { status: 500 });
  }
}