import { useState } from "react";
import { format } from "date-fns";

interface GenerateStoryParams {
  date: Date;
  genre: string;
  mood: string;
  style: string;
  range: string;
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
    currentContent = "",
  }: GenerateStoryParams): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    const dateStr = format(date, "MMMM d, yyyy");

    // Construct the prompt for Gemini
    let prompt = `Write a short, creative journal entry for ${dateStr}. 
    Genre: ${genre}. 
    Mood: ${mood}. 
    Style: ${style}. 
    Focus: ${range === "current" ? "Events of this specific day" : "A summary of recent events"}.
    Keep it under 150 words and make it engaging.`;

    if (currentContent && currentContent.trim().length > 0) {
      prompt += `\n\nContext from user's current writing: "${currentContent}"`;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          model: "google/gemini-flash-1.5", // Explicitly requesting Gemini
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
