import { useState } from "react";
import { format } from "date-fns";

interface GenerateStoryParams {
  date: Date;
  genre: string;
  mood: string;
  style: string;
  range: string;
  length?: string;
  currentContent?: string;
  isPictureBook?: boolean; // Add this flag
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
    length = "medium",
    currentContent = "",
    isPictureBook = false, // Default to false
  }: GenerateStoryParams): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    const dateStr = format(date, "MMMM d, yyyy");

    let lengthInstruction = "";
    switch (length) {
      case "short":
        lengthInstruction = "strictly under 100 words";
        break;
      case "medium":
        lengthInstruction = "approximately 200-300 words";
        break;
      case "long":
        lengthInstruction = "approximately 450-550 words";
        break;
      default:
        lengthInstruction = "approximately 250 words";
    }

    let prompt = "";

    if (isPictureBook) {
      // Special Prompt for Picture Book - Request JSON
      prompt = `You are a creative writing assistant. Create a "Picture Book" story for the date ${dateStr}.
      
      Parameters:
      - Genre: ${genre}
      - Mood: ${mood}
      - Style: ${style}
      - Length: ${lengthInstruction} total.
      
      OUTPUT FORMAT:
      Please provide the response in strict JSON format with an array of "pages". Each page object should have:
      - "text": The story text for that page.
      - "image_keyword": A single, descriptive keyword (or short phrase) to search for a relevant image (e.g., "dark forest", "sunny beach", "magical cat").
      
      Example JSON Structure:
      {
        "pages": [
          { "text": "Once upon a time...", "image_keyword": "fantasy castle" },
          { "text": "The sun was setting...", "image_keyword": "sunset" }
        ]
      }
      
      Do not include markdown formatting (like \`\`\`json). Just the raw JSON string.`;
    } else {
      // Standard Text Prompt
      prompt = `You are a creative writing assistant. Write a journal entry for the date ${dateStr}.
      
      Parameters:
      - Genre: ${genre}
      - Mood: ${mood}
      - Style: ${style}
      - Focus: ${range === "current" ? "Events of this specific day" : "A summary of recent events"}
      - Length: ${lengthInstruction}.
      `;
    }

    if (currentContent && currentContent.trim().length > 0) {
      prompt += `\n\nCONTEXT (The user has already written this): "${currentContent}". Incorporate these themes.`;
    } else {
      prompt += `\n\nINSTRUCTION: The user hasn't written anything yet. Create a fresh story.`;
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch story");
      }

      return data.response;
    } catch (err) {
      console.error("Gemini generation failed:", err);
      setError("Failed to generate story");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateStory, isGenerating, error };
}
