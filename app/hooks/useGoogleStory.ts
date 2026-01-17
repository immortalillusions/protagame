import { useState } from "react";
import { format } from "date-fns";

interface GenerateStoryParams {
  date: Date;
  genre: string;
  mood: string;
  style: string;
  range: string;
  length: string; // Added length parameter
  currentContent?: string;
}

export function useGoogleStory() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStory = async ({
    date,
    genre,
    mood,
    style,
    range,
    length, // Destructure length
    currentContent = "",
  }: GenerateStoryParams): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    const dateStr = format(date, "MMMM d, yyyy");

    // Map length to word count
    const wordCountMap: Record<string, number> = {
      short: 100,
      medium: 250,
      long: 500,
    };
    const targetWords = wordCountMap[length] || 250;

    // Construct the prompt for Gemini with dynamic length
    let prompt = `Write a creative journal entry for ${dateStr}. 
    Genre: ${genre}. 
    Mood: ${mood}. 
    Style: ${style}. 
    Focus: ${range === "current" ? "Events of this specific day" : "A summary of recent events"}.
    
    IMPORTANT: The story MUST be approximately ${targetWords} words long. ${
      length === "long"
        ? "This should be a detailed, immersive story with rich descriptions and developed narrative."
        : length === "short"
          ? "Keep it concise but impactful."
          : "Balance detail with brevity."
    }
    
    Make it engaging and creative.`;

    if (currentContent && currentContent.trim().length > 0) {
      prompt += `\n\nContext from user's current writing: "${currentContent}"`;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          model: "google/gemini-flash-1.5",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch story");
      }

      const data = await response.json();
      return data.response;
    } catch (err) {
      console.error("Story generation failed:", err);
      setError("Failed to generate story");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateStory, isGenerating, error };
}
