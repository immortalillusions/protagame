"use client";

import { useState } from "react";
// Use the hook created previously
import { useGoogleStory } from "@/app/hooks/useGoogleStory";

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
  // UI States
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [generatedText, setGeneratedText] = useState("");

  // Logic Hook
  const { generateStory, isGenerating } = useGoogleStory();

  // Form State
  const [selectedRange, setSelectedRange] = useState("current");
  const [genre, setGenre] = useState("Fantasy");
  const [mood, setMood] = useState("Mysterious");
  const [styleValue, setStyleValue] = useState(50);
  const [length, setLength] = useState("medium"); // New length state

  const getStyleLabel = (val: number) => {
    if (val < 33) return "Abstract";
    if (val > 66) return "Reality";
    return "Balanced";
  };

  const handleGenerateClick = async () => {
    const style = getStyleLabel(styleValue);

    // We now pass 'length' directly to the hook
    const story = await generateStory({
      date: currentDate,
      genre,
      mood,
      style,
      range: selectedRange,
      length: length, // Pass the raw length state ("short", "medium", "long")
      currentContent: currentJournalContent,
    });

    if (story) {
      setGeneratedText(story);
      setIsConfigOpen(false); // Close config
      setIsResultOpen(true); // Open result
    }
  };

  const handleConfirmStory = () => {
    onStoryGenerated(generatedText);
    setIsResultOpen(false);
    setGeneratedText("");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `story-${currentDate.toISOString().split("T")[0]}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsConfigOpen(true)}
        className="fixed left-6 top-6 z-[60] flex items-center justify-center w-14 h-14 bg-amber-600 text-white rounded-full shadow-xl border-4 border-white/50 hover:scale-110 transition-transform group pointer-events-auto"
        title="Generate Story"
      >
        <span className="text-2xl">{isGenerating ? "⏳" : "✨"}</span>
        <span className="absolute left-full ml-4 bg-black/75 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Generate Story
        </span>
      </button>

      {/* 1. Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto">
          <div className="bg-[#fdf6e9] border-2 border-amber-200 shadow-2xl max-w-md w-full p-6 rounded-xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
              <span>✨</span> Weaver's Inspiration
            </h3>

            {/* ... Existing Configuration UI ... */}
            <div className="space-y-6">
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

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-amber-800">
                  Mood
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mysterious..."
                  className="w-full p-2 rounded-lg border border-amber-300 bg-white/50 text-amber-900"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                />
              </div>

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
                className="px-4 py-2 text-amber-800 hover:bg-amber-100 rounded-lg"
                onClick={() => setIsConfigOpen(false)}
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700 disabled:opacity-50"
                onClick={handleGenerateClick}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "✨ Generate"}
              </button>
            </div>

            <button
              onClick={() => setIsConfigOpen(false)}
              className="absolute top-4 right-4 text-amber-800/50 hover:text-amber-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. Result Modal (DaisyUI style) */}
      {isResultOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-amber-50">
              <h3 className="font-serif text-2xl font-bold text-amber-900">
                Your Story
              </h3>
              <button
                onClick={() => setIsResultOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="prose prose-amber max-w-none text-gray-700 font-serif leading-relaxed whitespace-pre-wrap">
                {generatedText}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between gap-4">
              <button
                onClick={handleDownload}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center gap-2 text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsResultOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Discard
                </button>
                <button
                  onClick={handleConfirmStory}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-md hover:shadow-lg transition-all text-sm font-bold flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add to Journal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
