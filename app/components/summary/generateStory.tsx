"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Hourglass, BookOpen } from 'lucide-react';

interface GenerateStoryProps {
  currentDate: Date;
  onStoryGenerated: (story: string) => void;
  currentJournalContent?: string;
}

export default function GenerateStory({
  currentDate,
  onStoryGenerated,
  currentJournalContent = "",
}: GenerateStoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingJourney, setIsGeneratingJourney] = useState(false);
  const [journeyStory, setJourneyStory] = useState<string>('');
  const [showJourneyOverlay, setShowJourneyOverlay] = useState(false);

  // Form State - removed selectedRange, always use "current" (today)
  const [genre, setGenre] = useState("Fantasy");
  const [mood, setMood] = useState("Mysterious");
  const [styleValue, setStyleValue] = useState(50);
  const [length, setLength] = useState("medium"); // short, medium, long

  const getStyleLabel = (val: number) => {
    if (val < 33) return "Abstract";
    if (val > 66) return "Reality";
    return "Balanced";
  };

  const getLengthInstruction = (len: string) => {
    switch (len) {
      case "short":
        return "Keep it concise, around 100 words";
      case "medium":
        return "Write approximately 250 words";
      case "long":
        return "Write a detailed entry of approximately 500 words";
      default:
        return "Write approximately 250 words";
    }
  };

  // Load journey story on component mount
  useEffect(() => {
    const loadJourneyStory = async () => {
      try {
        const response = await fetch("/api/journal?date=journey-story");
        const data = await response.json();
        
        if (data.success && data.entry && data.entry.story) {
          setJourneyStory(data.entry.story);
        }
      } catch (error) {
        console.error("Failed to load journey story:", error);
      }
    };
    
    loadJourneyStory();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Construct the prompt
    const style = getStyleLabel(styleValue);
    const dateStr = format(currentDate, "MMMM d, yyyy");
    const lengthInstruction = getLengthInstruction(length);

    let prompt = `You are a creative writing assistant. Write a journal entry for ${dateStr}.
    
Parameters:
- Genre: ${genre}
- Mood: ${mood}
- Style: ${style}
- Focus: Events of this specific day (today)
- Length: ${lengthInstruction}

IMPORTANT: You MUST follow the length instruction. ${length === "short" ? "Keep it under 120 words." : length === "long" ? "Write at least 450 words, up to 550 words. Be detailed and immersive." : "Write between 200-300 words."}

Make the writing engaging and creative.`;

    if (currentJournalContent && currentJournalContent.trim().length > 0) {
      prompt += `\n\nContext from user's current writing: "${currentJournalContent}". Incorporate these themes naturally.`;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          model: "google/gemini-3-flash-preview",
        }),
      });

      const data = await response.json();

      if (data.response) {
        onStoryGenerated(data.response);
        setIsOpen(false);
      } else if (data.error) {
        // Check for credit/quota errors
        if (data.error.includes('credits') || data.error.includes('quota') || data.error.includes('billing') || data.error.includes('insufficient funds')) {
          alert("⚠️ API Credits Exhausted!\n\nOpenRouter has run out of credits. Please add more credits to your OpenRouter account to continue generating stories.\n\nVisit: https://openrouter.ai/credits");
        } else {
          alert(`Failed to generate story: ${data.error}`);
        }
      }
    } catch (error) {
      console.error("Failed to generate story:", error);
      alert("Failed to generate story. Please check your internet connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateJourney = async () => {
    setIsGeneratingJourney(true);

    try {
      const style = getStyleLabel(styleValue);

      const response = await fetch("/api/journey-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre,
          mood,
          style,
          length: "long",
        }),
      });

      const data = await response.json();

      if (data.success && data.story) {
        setJourneyStory(data.story);
        
        // Save the journey story to a separate file
        try {
          const saveResponse = await fetch("/api/journal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: "journey-story", // Special date key for journey story
              content: "", // No regular content for journey story
              story: data.story, // Save as story field
              createdAt: new Date().toISOString(),
            }),
          });
          
          if (!saveResponse.ok) {
            console.error("Failed to save journey story:", await saveResponse.text());
          }
        } catch (saveError) {
          console.error("Failed to save journey story:", saveError);
        }
        
        setIsOpen(false);
      } else {
        // Check for credit/quota errors
        if (data.error && (data.error.includes('credits') || data.error.includes('quota') || data.error.includes('billing') || data.error.includes('insufficient funds'))) {
          alert("⚠️ API Credits Exhausted!\n\nOpenRouter has run out of credits. Please add more credits to your OpenRouter account to continue generating journey stories.\n\nVisit: https://openrouter.ai/credits");
        } else {
          alert(data.error || "Failed to generate journey story");
        }
      }
    } catch (error) {
      console.error("Failed to generate journey story:", error);
      // Check if it's a network error or server error that might indicate credit issues
      if (error instanceof Error && (error.message.includes('credits') || error.message.includes('quota') || error.message.includes('billing'))) {
        alert("⚠️ API Credits Exhausted!\n\nOpenRouter has run out of credits. Please add more credits to your OpenRouter account to continue generating journey stories.\n\nVisit: https://openrouter.ai/credits");
      } else {
        alert("Failed to generate journey story. Please check your internet connection and try again.");
      }
    } finally {
      setIsGeneratingJourney(false);
    }
  };

  // Handle PDF download
  const downloadJourneyAsPDF = () => {
    if (!journeyStory || !journeyStory.trim()) {
      alert("No journey story to download!");
      return;
    }

    // Create a simple HTML structure for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Journey Story - ProtagaMe</title>
        <style>
          body { 
            font-family: Georgia, serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 40px auto; 
            padding: 20px;
            color: #333;
          }
          h1 { 
            color: #8B4513; 
            text-align: center; 
            border-bottom: 2px solid #D4AF37;
            padding-bottom: 10px;
          }
          .story { 
            white-space: pre-wrap; 
            font-size: 16px; 
            text-align: justify;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>Your Journey Story</h1>
        <div class="story">${journeyStory}</div>
        <div class="footer">
          Generated by ProtagaMe - Journals to Journey!<br>
          ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;

    // Create and download the file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journey-story-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Floating Action Button - Top Left */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-6 top-6 z-[60] flex items-center justify-center w-14 h-14 bg-amber-600 text-white rounded-full shadow-xl border-4 border-white/50 hover:scale-110 transition-transform group pointer-events-auto"
        title="Generate Story"
      >
        <span className="text-2xl">{isGenerating ? <Hourglass className="w-6 h-6 animate-spin" /> : "✦"}</span>

        {/* Tooltip Label */}
        <span className="absolute left-full ml-4 bg-black/75 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Generate Story
        </span>
      </button>

      {/* Journey Story Toggle Button - Below main button */}
      <button
        onClick={() => setShowJourneyOverlay(true)}
        disabled={!journeyStory}
        className={`fixed left-6 top-24 z-[60] flex items-center justify-center w-14 h-14 rounded-full shadow-xl border-4 border-white/50 transition-all group pointer-events-auto ${
          journeyStory 
            ? 'bg-amber-600 text-white hover:scale-110 cursor-pointer' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={journeyStory ? "View Journey Story" : "Generate a Journey Story first"}
      >
        <span className="text-2xl"><BookOpen className="w-6 h-6" /></span>

        {/* Tooltip Label */}
        <span className="absolute left-full ml-4 bg-black/75 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {journeyStory ? "View Journey Story" : "Generate Journey Story first"}
        </span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto">
          <div className="bg-[#fdf6e9] border-2 border-amber-200 shadow-2xl max-w-md w-full p-6 rounded-xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
              <span>~</span> Your Story
            </h3>

            <div className="space-y-6">
              {/* Length Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-amber-800">
                  Length
                </label>
                <div className="flex gap-2 w-full">
                  <button
                    className={`flex-1 py-2 px-2 text-sm rounded-lg border transition-colors ${length === "short" ? "bg-amber-600 text-white border-amber-600" : "border-amber-300 text-amber-900 hover:bg-amber-100"}`}
                    onClick={() => setLength("short")}
                  >
                    Short (~100w)
                  </button>
                  <button
                    className={`flex-1 py-2 px-2 text-sm rounded-lg border transition-colors ${length === "medium" ? "bg-amber-600 text-white border-amber-600" : "border-amber-300 text-amber-900 hover:bg-amber-100"}`}
                    onClick={() => setLength("medium")}
                  >
                    Medium (~250w)
                  </button>
                  <button
                    className={`flex-1 py-2 px-2 text-sm rounded-lg border transition-colors ${length === "long" ? "bg-amber-600 text-white border-amber-600" : "border-amber-300 text-amber-900 hover:bg-amber-100"}`}
                    onClick={() => setLength("long")}
                  >
                    Long (~500w)
                  </button>
                </div>
              </div>

              {/* Genre Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-amber-800">
                  Genre
                </label>
                <select
                  className="w-full p-2 rounded-lg border border-amber-300 bg-white/50 text-amber-900 focus:outline-none focus:border-amber-500"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                >
                  <option>Fantasy</option>
                  <option>Sci-Fi</option>
                  <option>Slice of Life</option>
                  <option>Mystery</option>
                  <option>Horror</option>
                  <option>Adventure</option>
                  <option>Romance</option>
                  <option>Comedy</option>
                </select>
              </div>

              {/* Mood Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-amber-800">
                  Mood
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mysterious, Joyful..."
                  className="w-full p-2 rounded-lg border border-amber-300 bg-white/50 text-amber-900 placeholder-amber-900/40 focus:outline-none focus:border-amber-500"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                />
              </div>

              {/* Style Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-amber-800">
                    Style
                  </label>
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded border border-amber-200">
                    {getStyleLabel(styleValue)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={styleValue}
                  onChange={(e) => setStyleValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  step="25"
                />
                <div className="w-full flex justify-between text-xs px-1 mt-1 text-amber-700/60 font-medium">
                  <span>Abstract</span>
                  <span>Reality</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-8">
              {/* Journey Story Button with tooltip */}
              <div className="relative group">
                <button
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-border"
                  onClick={handleGenerateJourney}
                  disabled={isGeneratingJourney || isGenerating}
                  title="Create a journey story from all your journal entries"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 animate-pulse opacity-20"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
                    {isGeneratingJourney ? "Weaving Journey..." : "Create Life Story"}
                  </span>
                </button>
                
                {/* Tooltip */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-16 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[60]">
                  Combines all your journal entries into one epic story
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>

              {/* Regular buttons */}
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                  disabled={isGenerating || isGeneratingJourney}
                >
                  Cancel
                </button>
                <div className="relative group">
                  <button
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 hover:shadow-lg transition-all min-w-[120px] flex justify-center items-center disabled:opacity-50"
                    onClick={handleGenerate}
                    disabled={isGenerating || isGeneratingJourney}
                  >
                    {isGenerating ? "Generating..." : "Generate for Today"}
                  </button>
                  
                  {/* Tooltip */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -top-12 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[60]">
                    Generate story for current day only
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Close button X */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-amber-800/50 hover:text-amber-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Journey Story Overlay */}
      {showJourneyOverlay && journeyStory && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto"
          style={{ zIndex: 99999 }}
        >
          <div className="bg-[#fdf6e9] border-2 border-orange-200 shadow-2xl max-w-4xl w-full mx-4 p-6 rounded-xl relative max-h-[90vh] overflow-hidden flex flex-col">
            <h3 className="font-serif text-3xl font-bold text-orange-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-8 h-8 mt-1" /> Your Journey Story
            </h3>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap gap-3 mb-4 justify-center">
              {/* Download PDF Button */}
              <div className="relative group">
                <button
                  onClick={downloadJourneyAsPDF}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Download PDF
                </button>
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-12 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-60">
                  Download story as HTML/PDF file
                </div>
              </div>
            </div>

            {/* Story Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-white/50 p-6 rounded-lg border border-orange-100 prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-black leading-relaxed">
                {journeyStory}
              </div>
            </div>

            {/* Close button */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-6 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 hover:shadow-lg transition-all"
                onClick={() => setShowJourneyOverlay(false)}
              >
                Close
              </button>
            </div>

            {/* Close button X */}
            <button
              onClick={() => setShowJourneyOverlay(false)}
              className="absolute top-4 right-4 text-orange-800/50 hover:text-orange-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
