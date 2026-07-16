import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key not set' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    
    // Ambil hanya model yang support generateContent
    const models = data.models?.filter((m: any) => 
      m.supportedGenerationMethods?.includes('generateContent')
    ).map((m: any) => m.name) || [];
    
    return NextResponse.json({ 
      available_models: models,
      raw: data 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}