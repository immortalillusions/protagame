import { OpenRouter } from '@openrouter/sdk';
import { NextRequest, NextResponse } from 'next/server';

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const completion = await openRouter.chat.send({
      model: 'openai/gpt-4o-mini', // Using a more reliable model
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
