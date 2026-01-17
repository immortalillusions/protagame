"use client";

import { useState } from "react";

interface GenerateStoryProps {
  currentDate: Date;
}

export default function GenerateStory({ currentDate }: GenerateStoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [selectedRange, setSelectedRange] = useState("current");
  const [genre, setGenre] = useState("Fantasy");
  const [mood, setMood] = useState("");
  const [styleValue, setStyleValue] = useState(50);

  const getStyleLabel = (val: number) => {
    if (val < 33) return "Abstract";
    if (val > 66) return "Reality";
    return "Balanced";
  };

  const handleGenerate = () => {
    // Placeholder for your API call
    console.log("Generating story...", {
      range: selectedRange,
      genre,
      mood,
      style: getStyleLabel(styleValue),
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button (Left Side) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-40 btn btn-circle btn-lg btn-primary shadow-xl border-4 border-white/50 hover:scale-110 transition-transform group"
        title="Generate Story"
      >
        <span className="text-2xl">✨</span>
        {/* Tooltip Label */}
        <span className="absolute left-full ml-4 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Generate Story
        </span>
      </button>

      {/* DaisyUI Modal */}
      {isOpen && (
        <dialog className="modal modal-open bg-black/40 backdrop-blur-sm">
          <div className="modal-box bg-amber-50 border-2 border-amber-200 shadow-2xl max-w-md">
            <form method="dialog">
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-amber-900"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </form>

            <h3 className="font-serif text-2xl font-bold text-amber-900 mb-6">
              Weave a Story
            </h3>

            <div className="space-y-5">
              {/* 1. Select Days */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-amber-800">
                    Which days?
                  </span>
                </label>
                <select
                  className="select select-bordered bg-white border-amber-200 focus:border-amber-500 text-amber-900"
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                >
                  <option value="current">Current Entry Only</option>
                  <option value="week">Past 7 Days</option>
                  <option value="month">Entire Month</option>
                </select>
              </div>

              {/* 2. Genre */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-amber-800">
                    Genre
                  </span>
                </label>
                <select
                  className="select select-bordered bg-white border-amber-200 focus:border-amber-500 text-amber-900"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                >
                  <option>Fantasy</option>
                  <option>Sci-Fi</option>
                  <option>Mystery</option>
                  <option>Slice of Life</option>
                  <option>Horror</option>
                  <option>Adventure</option>
                  <option>Noir</option>
                </select>
              </div>

              {/* 3. Mood */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-amber-800">
                    Mood
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dreamy, Melancholic, Energetic..."
                  className="input input-bordered bg-white border-amber-200 focus:border-amber-500 text-amber-900 placeholder-amber-900/40"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                />
              </div>

              {/* 4. Abstract vs Reality */}
              <div className="form-control pt-2">
                <label className="label cursor-pointer justify-between">
                  <span className="label-text font-semibold text-amber-800">
                    Style
                  </span>
                  <span className="badge badge-primary badge-outline">
                    {getStyleLabel(styleValue)}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={styleValue}
                  onChange={(e) => setStyleValue(parseInt(e.target.value))}
                  className="range range-primary range-xs"
                  step="25"
                />
                <div className="w-full flex justify-between text-xs px-2 mt-2 text-amber-700/60 font-medium">
                  <span>Abstract</span>
                  <span>Reality</span>
                </div>
              </div>
            </div>

            <div className="modal-action mt-8">
              <button
                className="btn btn-ghost text-amber-800 hover:bg-amber-100"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary text-white shadow-md hover:shadow-lg hover:scale-105 transition-all"
                onClick={handleGenerate}
              >
                ✨ Generate
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
