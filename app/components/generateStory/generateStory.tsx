"use client";

import { useState } from "react";
// Import the custom hook
import { useGoogleStory } from "../../hooks/useGoogleStory";

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

  // Use the hook
  const { generateStory, isGenerating } = useGoogleStory();

  // Form State
  const [selectedRange, setSelectedRange] = useState("current");
  const [genre, setGenre] = useState("Fantasy");
  const [mood, setMood] = useState("Mysterious");
  const [styleValue, setStyleValue] = useState(50);

  const getStyleLabel = (val: number) => {
    if (val < 33) return "Abstract";
    if (val > 66) return "Reality";
    return "Balanced";
  };

  const handleGenerateClick = async () => {
    const style = getStyleLabel(styleValue);

    // Call the hook function
    const story = await generateStory({
      date: currentDate,
      genre,
      mood,
      style,
      range: selectedRange,
      currentContent: currentJournalContent,
    });

    if (story) {
      onStoryGenerated(story);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Action Button - Top Left */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-6 top-6 z-[60] flex items-center justify-center w-14 h-14 bg-amber-600 text-white rounded-full shadow-xl border-4 border-white/50 hover:scale-110 transition-transform group pointer-events-auto"
        title="Generate Story"
      >
        <span className="text-2xl">{isGenerating ? "⏳" : "✨"}</span>

        {/* Tooltip Label */}
        <span className="absolute left-full ml-4 bg-black/75 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Generate Story
        </span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto">
          <div className="bg-[#fdf6e9] border-2 border-amber-200 shadow-2xl max-w-md w-full p-6 rounded-xl relative">
            <h3 className="font-serif text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
              <span>✨</span> Weaver's Inspiration
            </h3>

            <div className="space-y-6">
              {/* Range Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-amber-800">
                  Context Range
                </label>
                <div className="flex gap-2 w-full">
                  <button
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${selectedRange === "current" ? "bg-amber-600 text-white border-amber-600" : "border-amber-300 text-amber-900 hover:bg-amber-100"}`}
                    onClick={() => setSelectedRange("current")}
                  >
                    Today
                  </button>
                  <button
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${selectedRange === "week" ? "bg-amber-600 text-white border-amber-600" : "border-amber-300 text-amber-900 hover:bg-amber-100"}`}
                    onClick={() => setSelectedRange("week")}
                  >
                    This Week
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

            <div className="flex justify-end gap-3 mt-8">
              <button
                className="px-4 py-2 text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 hover:shadow-lg transition-all min-w-[120px] flex justify-center items-center"
                onClick={handleGenerateClick}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "✨ Generate"}
              </button>
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
    </>
  );
}
