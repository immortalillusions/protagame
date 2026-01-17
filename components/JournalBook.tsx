"use client";

import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import Image from "next/image";
import GenerateStory from "../app/components/summary/generateStory";

interface VisualPrompt {
  visualPrompt: string;
  mood: string;
  colorPalette: string;
  cinematicStyle: string;
  duration: string;
}

interface JournalEntry {
  date: string;
  content: string;
  visualPrompt?: VisualPrompt;
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function JournalBook() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [content, setContent] = useState("");
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const dateStr = format(currentDate, "yyyy-MM-dd");
  const displayDate = format(currentDate, "MMMM d, yyyy");

  // Load journal entry for current date
  const loadJournalEntry = async () => {
    try {
      const response = await fetch(`/api/journal?date=${dateStr}`);
      const data = await response.json();

      if (data.success && data.entry) {
        setEntry(data.entry);
        setContent(data.entry.content);
      } else {
        setEntry(null);
        setContent("");
      }
    } catch (error) {
      console.error("Failed to load journal entry:", error);
      setEntry(null);
      setContent("");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/api/journal?date=${dateStr}`);
        const data = await response.json();

        if (data.success && data.entry) {
          setEntry(data.entry);
          setContent(data.entry.content);
        } else {
          setEntry(null);
          setContent("");
        }
      } catch (error) {
        console.error("Failed to load journal entry:", error);
        setEntry(null);
        setContent("");
      }
    };

    loadData();
  }, [dateStr]);

  const saveJournalEntry = async (includeVisualPrompt?: VisualPrompt) => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateStr,
          content: content.trim(),
          visualPrompt: includeVisualPrompt || entry?.visualPrompt,
          mediaUrl: entry?.mediaUrl,
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        await loadJournalEntry(); // Reload to get updated timestamps
      }
    } catch (error) {
      console.error("Failed to save journal entry:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const generateMedia = async () => {
    if (!content.trim()) {
      alert("Please write something in your journal first!");
      return;
    }

    setIsGeneratingMedia(true);
    try {
      const response = await fetch("/api/generate-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalEntry: content.trim(),
          date: dateStr,
        }),
      });

      const data = await response.json();

      if (data.success && data.visualPrompt) {
        // Save the journal entry with both visual prompt and media URL if available
        const updatedEntry = {
          date: dateStr,
          content: content.trim(),
          visualPrompt: data.visualPrompt,
          mediaUrl: data.mediaUrl || entry?.mediaUrl,
        };

        // Save to backend
        const saveResponse = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEntry),
        });

        if (saveResponse.ok) {
          setLastSaved(new Date());
          // Reload the entry to get the updated data
          const reloadResponse = await fetch(`/api/journal?date=${dateStr}`);
          const reloadData = await reloadResponse.json();

          if (reloadData.success && reloadData.entry) {
            setEntry(reloadData.entry);
          }
        }
      } else {
        alert(data.error || "Failed to generate media");
      }
    } catch (error) {
      console.error("Media generation failed:", error);
      alert("Failed to generate media");
    } finally {
      setIsGeneratingMedia(false);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentDate(subDays(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  // Handle story generated from GenerateStory component
  const handleStoryGenerated = (story: string) => {
    // Append the generated story to existing content, or set it as new content
    if (content.trim()) {
      setContent(content + "\n\n" + story);
    } else {
      setContent(story);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!content.trim()) return;

    const saveContent = async () => {
      if (isSaving) return;

      setIsSaving(true);
      try {
        const response = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: dateStr,
            content: content.trim(),
            visualPrompt: entry?.visualPrompt,
            mediaUrl: entry?.mediaUrl,
          }),
        });

        if (response.ok) {
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error("Failed to save journal entry:", error);
      } finally {
        setIsSaving(false);
      }
    };

    const timer = setTimeout(() => {
      saveContent();
    }, 2000); // Auto-save after 2 seconds of no typing

    return () => clearTimeout(timer);
  }, [content, dateStr, entry?.visualPrompt, entry?.mediaUrl, isSaving]);

  return (
    <div className="min-h-screen bg-[var(--c-tan)] p-8 flex items-center justify-center overflow-hidden">
      {/* Generate Story Button - Floating */}
      <GenerateStory
        currentDate={currentDate}
        onStoryGenerated={handleStoryGenerated}
        currentJournalContent={content}
      />

      {/* Ambient environment light */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-radial from-[var(--c-cream)]/20 to-[var(--c-ink)]/5" />

      <div className="max-w-6xl w-full mx-auto relative perspective-container z-10">
        {/* Book Container - The Physical Object */}
        <div className="relative layer-3d group">
          {/* 1. Base Shadow (The desk contact) */}
          <div className="absolute top-4 left-4 right-[-10px] bottom-[-10px] bg-[var(--c-shadow-warm)]/20 blur-xl rounded-lg transform translate-z-[-20px]" />

          {/* 2. Back Cover (Thick leather/hardcover base) */}
          <div className="absolute inset-0 bg-[#3a2e22] rounded-r-xl rounded-l-md transform translate-z-[-5px] shadow-2xl border-l-[12px] border-[#2a2118]" />

          {/* 3. The Paper Block (Main writing surface) */}
          <div className="relative bg-[var(--c-cream)] rounded-r-lg min-h-[80vh] shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] border-r-4 border-[#e6e2d6] paper-texture flex overflow-hidden">
            {/* Spine/Gutter Shadow */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-[image:var(--spine-gradient)] pointer-events-none z-20 mix-blend-multiply" />

            {/* Content Container */}
            <div className="flex-1 pl-16 pr-12 py-12 flex flex-col relative z-10">
              {/* Header: Date Navigation */}
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--c-gold)]/30">
                <button
                  onClick={() => navigateDate("prev")}
                  className="p-3 text-[var(--c-ink-light)] hover:text-[var(--c-gold)] transition-colors lift-on-hover press-on-click"
                  title="Previous day"
                >
                  <span className="font-serif text-xl">←</span>
                </button>

                <div className="text-center group-hover:transform group-hover:translate-z-[5px] transition-transform duration-500">
                  <h1 className="text-3xl font-serif text-[var(--c-ink)] text-engraved tracking-wide">
                    {displayDate}
                  </h1>
                  <div className="h-1 w-24 mx-auto mt-2 bg-gradient-to-r from-transparent via-[var(--c-gold)]/40 to-transparent" />
                </div>

                <button
                  onClick={() => navigateDate("next")}
                  className="p-3 text-[var(--c-ink-light)] hover:text-[var(--c-gold)] transition-colors lift-on-hover press-on-click"
                  title="Next day"
                  disabled={
                    format(currentDate, "yyyy-MM-dd") >=
                    format(new Date(), "yyyy-MM-dd")
                  }
                >
                  <span className="font-serif text-xl">→</span>
                </button>
              </div>

              {/* Main Content Area - 2 Column Layout */}
              <div className="flex-1 flex gap-12 relative max-h-[calc(80vh-200px)] overflow-hidden">
                {/* Left Column: Text Area */}
                <div className="flex-1 flex flex-col min-w-0 scrollbar-thin">
                  <div className="flex-1 overflow-hidden">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What is on your mind today?"
                      className="w-full h-full bg-transparent border-none outline-none resize-none 
                        font-serif text-xl leading-[2rem] text-[var(--c-ink)] placeholder-[var(--c-ink-light)]/40
                        selection:bg-[var(--c-gold)]/20 pl-8 pr-4 py-2"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          transparent,
                          transparent 1.95rem,
                          rgba(212, 175, 55, 0.2) 1.95rem,
                          rgba(212, 175, 55, 0.2) 2rem
                        )`,
                        backgroundAttachment: "local",
                        backgroundPositionX: "2rem", // Offset the lines to account for left padding
                      }}
                    />
                  </div>

                  {/* Status Bar inside the text column */}
                  <div className="mt-4 flex items-center justify-between text-xs font-serif text-[var(--c-ink-light)] italic opacity-60">
                    <span>
                      {isSaving
                        ? "Saving..."
                        : lastSaved
                          ? `Last saved at ${format(lastSaved, "h:mm a")}`
                          : "Unsaved changes"}
                    </span>
                    <span className="pl-4 font-mono opacity-60">
                      {content.length} chars
                    </span>
                  </div>
                </div>

                {/* Right Column: Visual Component & Controls */}
                <div className="w-80 flex flex-col gap-8 shrink-0 relative z-20">
                  {/* Visual Prompt Card */}
                  {entry?.visualPrompt ? (
                    <div className="w-full bg-white p-3 shadow-lg transform rotate-1 hover:rotate-0 transition-all duration-500 border border-[var(--c-tan)] lift-on-hover">
                      {entry.mediaUrl && (
                        <div className="relative aspect-video mb-3 overflow-hidden bg-[var(--c-tan)]">
                          <Image
                            src={entry.mediaUrl}
                            alt="Cinematic scene"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <p className="font-serif text-sm text-[var(--c-ink)] leading-snug italic">
                          "{entry.visualPrompt.visualPrompt}"
                        </p>
                        <div className="flex gap-1 flex-wrap pt-1 border-t border-[var(--c-tan)]">
                          <span className="text-[10px] uppercase tracking-wider text-[var(--c-gold)] font-bold">
                            {entry.visualPrompt.mood}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Placeholder area if no image yet, to maintain balance or show empty state */
                    <div className="w-full aspect-[4/5] border-2 border-dashed border-[var(--c-gold)]/20 rounded-sm flex items-center justify-center">
                      <span className="text-[var(--c-gold)]/40 font-serif italic text-2xl">
                        ?
                      </span>
                    </div>
                  )}

                  {/* Generation Button */}
                  <button
                    onClick={generateMedia}
                    disabled={isGeneratingMedia || !content.trim()}
                    className="
                      w-full group relative px-6 py-4 bg-[var(--c-ink)] text-[var(--c-cream)] 
                      font-serif text-sm tracking-widest uppercase text-center
                      shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none
                      lift-on-hover press-on-click
                      overflow-hidden rounded-sm
                    "
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isGeneratingMedia ? "Dreaming..." : "Visualize"}
                      <span className="text-[var(--c-gold)]">✦</span>
                    </span>
                    <div className="absolute inset-0 bg-[var(--c-gold)]/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Page thickness effect on the right edge */}
            <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-gradient-to-l from-[#dcd8c8] to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
