import { NextRequest, NextResponse } from 'next/server';
import JournalService from '@/lib/journal-service';

export async function POST(request: NextRequest) {
  try {
    const { genre, mood, style, length = "long" } = await request.json();

    // Get all journal entries formatted for story generation
    const allEntries = await JournalService.getAllEntriesForStory();
    
    if (!allEntries || allEntries.trim() === "No journal entries found.") {
      return NextResponse.json(
        { error: 'No journal entries found to create a journey story' }, 
        { status: 400 }
      );
    }

    // Create the journey story prompt
    const prompt = `You are a creative storyteller. Create a cohesive narrative journey story that weaves together all of the user's journal entries into one flowing story.

Parameters:
- Genre: ${genre}
- Mood: ${mood} 
- Style: ${style}
- Length: Write a detailed story of approximately 800-1200 words

JOURNAL ENTRIES TO WEAVE TOGETHER:
${allEntries}

INSTRUCTIONS:
- Create a cohesive narrative arc that connects all these journal moments
- Transform the mundane into something magical/meaningful based on the genre
- Maintain the emotional truth of the original entries while crafting a compelling story
- Show character growth and development across the timeline
- Use the ${style} writing style and ${mood} mood throughout
- Make it feel like a complete journey with beginning, middle, and satisfying conclusion

Create a beautiful story that honors the user's real experiences while transforming them into something extraordinary.`;

    // Call the chat API to generate the story
    const response = await fetch(`${request.nextUrl.origin}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: prompt,
        model: "google/gemini-3-flash-preview",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate journey story");
    }

    return NextResponse.json({
      success: true,
      story: data.response,
      entriesCount: allEntries.split('\n\n').length
    });

  } catch (error) {
    console.error('Journey story generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate journey story' },
      { status: 500 }
    );
  }
}
