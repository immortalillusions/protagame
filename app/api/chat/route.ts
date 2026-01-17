import { OpenRouter } from '@openrouter/sdk';
import { NextRequest, NextResponse } from 'next/server';

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Use the requested model or default to Gemini Flash
    const selectedModel = model || 'google/gemini-3-flash-preview';

    // Use non-streaming for simpler response handling
    const completion = await openrouter.chat.send({
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      stream: false,
    });

    return NextResponse.json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenRouter API error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
