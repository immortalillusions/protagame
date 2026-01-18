"use client";

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { format, addDays, subDays } from "date-fns";
import Image from "next/image";
import GenerateStory from "../app/components/summary/generateStory";
import JournalEditor from "./JournalEditor";

// Audio hook for managing sounds
function useAudio() {
  const pageFlipRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);

  useEffect(() => {
    // Initialize audio elements on client side only
    pageFlipRef.current = new Audio("/sounds/page-flip.mp3");
    pageFlipRef.current.volume = 0.5;

    bgMusicRef.current = new Audio("/sounds/calm-music.mp3");
    bgMusicRef.current.volume = 0.3;
    bgMusicRef.current.loop = true;

    bgMusicRef.current.addEventListener("canplaythrough", () => {
      setIsMusicLoaded(true);
    });

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      if (pageFlipRef.current) {
        pageFlipRef.current = null;
      }
    };
  }, []);

  const playPageFlip = useCallback(() => {
    if (pageFlipRef.current) {
      pageFlipRef.current.currentTime = 0;
      pageFlipRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, []);

  const toggleMusic = useCallback(() => {
    if (!bgMusicRef.current) return;

    if (isMusicPlaying) {
      bgMusicRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      bgMusicRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
      setIsMusicPlaying(true);
    }
  }, [isMusicPlaying]);

  return { playPageFlip, toggleMusic, isMusicPlaying, isMusicLoaded };
}

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
  story?: string;
  visualPrompt?: VisualPrompt;
  mediaUrl?: string;
  audioUrl?: string;
  audioFormat?: string;
  audioGenerated?: string;
  createdAt: string;
  updatedAt: string;
}

// Memoized textarea component to prevent re-renders during typing
const OptimizedTextarea = memo(function OptimizedTextarea({
  value,
  onChange,
  readOnly,
  placeholder,
  showStory,
}: {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  placeholder: string;
  showStory: boolean;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!readOnly) {
        onChange(e.target.value);
      }
    },
    [onChange, readOnly],
  );

  return (
    <textarea
      value={value}
      onChange={handleChange}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full h-full bg-transparent border-none outline-none resize-none 
        font-serif text-xl leading-[2rem] text-[var(--c-ink)] placeholder-[var(--c-ink-light)]/40
        selection:bg-[var(--c-gold)]/20 pl-8 pr-4 py-2 ${showStory ? "cursor-default" : ""}`}
      style={{
        backgroundImage: `repeating-linear-gradient(
          transparent,
          transparent 1.95rem,
          rgba(212, 175, 55, 0.2) 1.95rem,
          rgba(212, 175, 55, 0.2) 2rem
        )`,
        backgroundAttachment: "local",
        backgroundPositionX: "2rem",
      }}
    />
  );
});

export default function JournalBook() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<Map<string, JournalEntry>>(new Map());
  const [localContent, setLocalContent] = useState(""); // Local state for immediate updates
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pendingSaves, setPendingSaves] = useState(new Set<string>());
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio hook
  const { playPageFlip, toggleMusic, isMusicPlaying, isMusicLoaded } =
    useAudio();

  const dateStr = format(currentDate, "yyyy-MM-dd");
  const displayDate = format(currentDate, "MMMM d, yyyy");

  // Get current entry from cache
  const currentEntry = entries.get(dateStr);

  // Debounced save function that doesn't block UI
  const debouncedSave = useMemo(() => {
    const timeouts = new Map<string, NodeJS.Timeout>();

    return (date: string, content: string) => {
      // Clear existing timeout for this date
      const existingTimeout = timeouts.get(date);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout for background save
      const timeout = setTimeout(async () => {
        if (!content.trim()) return;

        setPendingSaves((prev) => new Set(prev).add(date));

        try {
          const entry = entries.get(date);
          await fetch("/api/journal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date,
              content: content.trim(),
              story: entry?.story,
              visualPrompt: entry?.visualPrompt,
              mediaUrl: entry?.mediaUrl,
            }),
          });

          setLastSaved(new Date());
        } catch (error) {
          console.error("Background save failed:", error);
        } finally {
          setPendingSaves((prev) => {
            const updated = new Set(prev);
            updated.delete(date);
            return updated;
          });
        }

        timeouts.delete(date);
      }, 10000); // Save after 10 seconds of inactivity

      timeouts.set(date, timeout);
    };
  }, [entries]);

  // Memoized handlers to prevent re-renders
  const handleContentChange = useCallback(
    (value: string) => {
      setLocalContent(value);

      // Optimistically update the entry in memory
      setEntries((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(dateStr);
        if (existing) {
          updated.set(dateStr, {
            ...existing,
            content: value,
            updatedAt: new Date().toISOString(),
          });
        } else {
          updated.set(dateStr, {
            date: dateStr,
            content: value,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        return updated;
      });

      // Debounced background save (non-blocking)
      debouncedSave(dateStr, value);
    },
    [dateStr, debouncedSave],
  );

  // Load journal entry for current date (only when date changes)
  const loadJournalEntry = useCallback(
    async (date: string) => {
      // Don't reload if we already have this entry
      if (entries.has(date)) {
        const entry = entries.get(date);
        setLocalContent(entry?.content || "");
        setShowStory(false);
        
        // Load saved audio if available
        if (entry?.audioUrl && audioRef.current) {
          audioRef.current.src = entry.audioUrl;
          // Set up event handlers for existing audio
          audioRef.current.onplay = () => setIsPlayingAudio(true);
          audioRef.current.onpause = () => setIsPlayingAudio(false);
          audioRef.current.onended = () => setIsPlayingAudio(false);
        }
        
        return;
      }

      // Background loading - don't block the UI
      try {
        const response = await fetch(`/api/journal?date=${date}`);
        const data = await response.json();

        if (data.success && data.entry) {
          setEntries((prev) => new Map(prev).set(date, data.entry));
          // Only update localContent if we're still on the same date
          if (format(currentDate, "yyyy-MM-dd") === date) {
            setLocalContent(data.entry.content);
            
            // Load saved audio if available
            if (data.entry.audioUrl && audioRef.current) {
              audioRef.current.src = data.entry.audioUrl;
              // Set up event handlers for existing audio
              audioRef.current.onplay = () => setIsPlayingAudio(true);
              audioRef.current.onpause = () => setIsPlayingAudio(false);
              audioRef.current.onended = () => setIsPlayingAudio(false);
            }
          }
        } else {
          // Only clear content if we're still on the same date
          if (format(currentDate, "yyyy-MM-dd") === date) {
            setLocalContent("");
          }
        }
        // Only reset showStory if we're still on the same date
        if (format(currentDate, "yyyy-MM-dd") === date) {
          setShowStory(false);
        }
      } catch (error) {
        console.error("Failed to load journal entry:", error);
        // Only clear content on error if we're still on the same date
        if (format(currentDate, "yyyy-MM-dd") === date) {
          setLocalContent("");
          setShowStory(false);
        }
      }
    },
    [entries, currentDate],
  );

  // Load data when date changes
  useEffect(() => {
    const newDateStr = format(currentDate, "yyyy-MM-dd");

    // Immediately update UI with cached content or empty content
    const cachedEntry = entries.get(newDateStr);
    if (cachedEntry) {
      // Use cached content immediately
      setLocalContent(cachedEntry.content);
      setShowStory(false);
    } else {
      // Clear content immediately for new date, load in background
      setLocalContent("");
      setShowStory(false);
      // Load new content in background without blocking UI
      loadJournalEntry(newDateStr);
    }
  }, [currentDate, entries, loadJournalEntry]);

  const generateMedia = async () => {
    if (!localContent.trim()) {
      alert("Please write something in your journal first!");
      return;
    }

    try {
      const response = await fetch("/api/generate-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalEntry: localContent.trim(),
          date: dateStr,
        }),
      });

      const data = await response.json();

      if (data.success && data.visualPrompt) {
        // Optimistically update the entry in memory
        setEntries((prev) => {
          const updated = new Map(prev);
          const existing = updated.get(dateStr) || {
            date: dateStr,
            content: localContent.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          updated.set(dateStr, {
            ...existing,
            content: localContent.trim(),
            visualPrompt: data.visualPrompt,
            mediaUrl: data.mediaUrl || existing.mediaUrl,
            updatedAt: new Date().toISOString(),
          });
          return updated;
        });

        // Save to backend in background
        const saveResponse = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: dateStr,
            content: localContent.trim(),
            story: currentEntry?.story,
            visualPrompt: data.visualPrompt,
            mediaUrl: data.mediaUrl || currentEntry?.mediaUrl,
          }),
        });

        if (saveResponse.ok) {
          setLastSaved(new Date());
        } else {
          console.error(
            "Failed to save media generation:",
            await saveResponse.text(),
          );
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

  const navigateDate = useCallback(
    (direction: "prev" | "next") => {
      // Play page flip sound
      playPageFlip();

      // Save current content before navigating if there are unsaved changes
      if (
        localContent.trim() &&
        localContent !== (currentEntry?.content || "")
      ) {
        // Background save - don't block navigation
        fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: dateStr,
            content: localContent.trim(),
            story: currentEntry?.story,
            visualPrompt: currentEntry?.visualPrompt,
            mediaUrl: currentEntry?.mediaUrl,
          }),
        }).catch((error) => {
          console.error("Failed to save before navigation:", error);
        });
      }

      // Navigate immediately - completely instant, no await/async
      if (direction === "prev") {
        setCurrentDate((prev) => subDays(prev, 1));
      } else {
        setCurrentDate((prev) => addDays(prev, 1));
      }
    },
    [localContent, currentEntry, dateStr, playPageFlip],
  );

  // Handle story generated from GenerateStory component
  const handleStoryGenerated = useCallback(
    async (story: string) => {
      // Optimistically update the entry in memory
      setEntries((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(dateStr) || {
          date: dateStr,
          content: localContent,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        updated.set(dateStr, {
          ...existing,
          story,
          updatedAt: new Date().toISOString(),
        });
        return updated;
      });

      // Switch to story view immediately
      setShowStory(true);

      // Save to backend in background
      try {
        await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: dateStr,
            content: localContent,
            story: story,
            visualPrompt: currentEntry?.visualPrompt,
            mediaUrl: currentEntry?.mediaUrl,
          }),
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to save story:", error);
      }
    },
    [dateStr, localContent, currentEntry],
  );

  // Handle text-to-speech generation and playback
  const handleGenerateSpeech = useCallback(async () => {
    if (!currentEntry?.story || !currentEntry.story.trim()) {
      alert("No story content to read!");
      return;
    }

    setIsGeneratingSpeech(true);
    
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlayingAudio(false);
      }

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentEntry.story,
          date: dateStr, // Pass the date to save audio to database
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate speech");
      }

      // Convert response to blob and create audio URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Update the current entry with the audio URL
      setEntries((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(dateStr);
        if (existing) {
          updated.set(dateStr, {
            ...existing,
            audioUrl: audioUrl,
            audioFormat: 'mp3',
            audioGenerated: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        return updated;
      });

      // Create and configure audio element
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onplay = () => setIsPlayingAudio(true);
        audioRef.current.onpause = () => setIsPlayingAudio(false);
        audioRef.current.onended = () => {
          setIsPlayingAudio(false);
          URL.revokeObjectURL(audioUrl); // Clean up object URL
        };
        
        // Start playing automatically after generation
        await audioRef.current.play();
      }

    } catch (error) {
      console.error("Speech generation failed:", error);
      alert("Failed to generate speech. Please try again.");
    } finally {
      setIsGeneratingSpeech(false);
    }
  }, [currentEntry?.story, dateStr]);

  // Handle audio play/pause toggle
  const toggleAudioPlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Failed to resume audio playback:", error);
      });
    }
  }, [isPlayingAudio]);

  // Get display content based on current mode
  const displayContent = showStory ? currentEntry?.story || "" : localContent;
  const isStoryMode = showStory;

  // Status indicators
  const isSaving = pendingSaves.has(dateStr);
  const characterCount = displayContent.length;
  const statusText = isStoryMode ? "(story)" : "(journal)";

  const saveStatusText = isSaving
    ? "Saving..."
    : lastSaved
      ? `Last saved at ${format(lastSaved, "h:mm a")}`
      : "Unsaved changes";

  return (
    <div
      className="min-h-screen p-8 flex items-center justify-center overflow-hidden relative"
      style={{
        backgroundImage: "url(/desk.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Generate Story Button - Floating */}
      <GenerateStory
        currentDate={currentDate}
        onStoryGenerated={handleStoryGenerated}
        currentJournalContent={localContent}
      />

      {/* Music Toggle Button - Top Right */}
      <button
        onClick={toggleMusic}
        className={`fixed right-6 bottom-6 z-[60] flex items-center justify-center w-14 h-14 rounded-full shadow-xl border-4 border-white/50 transition-all group pointer-events-auto ${
          isMusicPlaying
            ? "bg-amber-600 text-white"
            : "bg-white/80 text-amber-800 hover:bg-amber-100"
        }`}
        title={isMusicPlaying ? "Pause Music" : "Play Calming Music"}
      >
        <span className="text-2xl">
          {isMusicPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
              {/* Sound waves */}
              <path d="M22 9c1.5 1.5 1.5 3 0 4.5" className="animate-pulse" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          )}
        </span>

        {/* Tooltip Label */}
        <span className="absolute right-full mr-4 bg-black/75 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {isMusicPlaying ? "Pause Music" : "Play Music"}
        </span>

        {/* Music playing indicator */}
        {isMusicPlaying && (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        )}
      </button>

      {/* Ambient environment overlay for readability */}
      <div className="fixed inset-0 pointer-events-none bg-black/20" />

      {/* Hidden audio element for speech playback */}
      <audio ref={audioRef} preload="none" />

      <div className="max-w-6xl w-full mx-auto relative perspective-container z-10">
        {/* Book Container - The Physical Object */}
        <div className="relative layer-3d group">
          {/* 1. Base Shadow (The desk contact) */}
          <div className="absolute top-4 left-4 right-[-10px] bottom-[-10px] bg-[var(--c-shadow-warm)]/20 blur-xl rounded-lg transform translate-z-[-20px]" />

          {/* 2. Back Cover (Thick leather/hardcover base) */}
          <div className="absolute inset-0 bg-[#3a2e22] rounded-r-xl rounded-l-md transform translate-z-[-5px] shadow-2xl border-l-[12px] border-[#2a2118]" />

          {/* 3. The Paper Block (Main writing surface) */}
          <div className="relative bg-[var(--c-cream)] rounded-r-lg min-h-[90vh] shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] border-r-4 border-[#e6e2d6] paper-texture flex overflow-hidden">
            {/* Spine/Gutter Shadow */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-[image:var(--spine-gradient)] pointer-events-none z-20 mix-blend-multiply" />

            {/* Content Container */}
            <div className="flex-1 pl-16 pr-12 pt-12 pb-0 flex flex-col relative">
              {/* Header: Date Navigation */}
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--c-gold)]/30 relative">
                <button
                  onClick={() => navigateDate("prev")}
                  className="p-3 text-[var(--c-ink-light)] hover:text-[var(--c-gold)] transition-colors lift-on-hover press-on-click active:scale-95"
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
                  className="p-3 text-[var(--c-ink-light)] hover:text-[var(--c-gold)] transition-colors lift-on-hover press-on-click active:scale-95"
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
              <div className="flex-1 flex gap-12 relative max-h-[calc(90vh-200px)] overflow-hidden">
                {/* Left Column: Text Area */}
                <div className="flex-1 flex flex-col min-w-0 scrollbar-thin">
                  {/* Toggle Button Row */}
                  <div className="flex gap-2 mb-4 justify-center ml-4 sm:ml-0">
                    <button
                      onClick={() => setShowStory(true)}
                      disabled={!currentEntry?.story}
                      className={`px-4 py-2 text-sm font-serif rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                        showStory
                          ? "bg-[var(--c-gold)]/20 text-[var(--c-ink)] border-2 border-[var(--c-gold)]"
                          : "text-[var(--c-ink-light)] hover:bg-[var(--c-gold)]/10"
                      }`}
                    >
                      Story {!currentEntry?.story && "(Generate first)"}
                    </button>
                    <button
                      onClick={() => setShowStory(false)}
                      className={`px-4 py-2 text-sm font-serif rounded-lg transition-all ${
                        !showStory
                          ? "bg-[var(--c-gold)]/20 text-[var(--c-ink)] border-2 border-[var(--c-gold)]"
                          : "text-[var(--c-ink-light)] hover:bg-[var(--c-gold)]/10"
                      }`}
                    >
                      Journal
                    </button>
                    
                    {/* Voice Button - Only show when on Story tab and story exists */}
                    {showStory && currentEntry?.story && (
                      <button
                        onClick={currentEntry?.audioUrl ? toggleAudioPlayback : handleGenerateSpeech}
                        disabled={isGeneratingSpeech}
                        className="px-3 py-2 text-sm font-serif rounded-lg transition-all bg-purple-600/20 text-purple-800 hover:bg-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-purple-600/30 hover:border-purple-600/50"
                        title={
                          isGeneratingSpeech
                            ? "Generating voice narration..."
                            : currentEntry?.audioUrl
                            ? isPlayingAudio
                              ? "Pause narration"
                              : "Play narration"
                            : "Generate voice narration"
                        }
                      >
                        {isGeneratingSpeech 
                          ? "🎤..." 
                          : currentEntry?.audioUrl 
                            ? isPlayingAudio 
                              ? "⏸️" 
                              : "▶️" 
                            : "🎤"}
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <OptimizedTextarea
                      value={displayContent}
                      onChange={handleContentChange}
                      readOnly={isStoryMode}
                      placeholder={
                        isStoryMode
                          ? "Generate a story first using the ✨ button"
                          : "What is on your mind today?"
                      }
                      showStory={showStory}
                    />
                  </div>

                  {/* Status Bar inside the text column */}
                  <div className="mt-4 flex items-center justify-between text-xs font-serif text-[var(--c-ink-light)] italic opacity-60">
                    <span>{saveStatusText}</span>
                    <span className="pl-4 font-mono opacity-60">
                      {characterCount} chars {statusText}
                    </span>
                  </div>
                </div>

                {/* Right Column: Visual Component & Controls */}
                <div className="w-80 flex flex-col gap-8 shrink-0 relative z-20">
                  {/* Visual Prompt Card */}
                  {currentEntry?.visualPrompt ? (
                    <div className="w-80 h-200 bg-white p-3 shadow-lg transform rotate-1 hover:rotate-0 transition-all duration-500 border border-[var(--c-tan)] lift-on-hover flex flex-col overflow-hidden">
                      {currentEntry.mediaUrl && (
                        <div className="relative aspect-video mb-3 overflow-hidden bg-[var(--c-tan)] flex-shrink-0">
                          <Image
                            src={currentEntry.mediaUrl}
                            alt="Cinematic scene"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex-1 overflow-y-auto scrollbar-thin pr-2 mb-3">
                          <p className="pl-1 font-serif text-sm text-[var(--c-ink)] leading-relaxed text-center">
                            {currentEntry.visualPrompt.visualPrompt.replace(
                              /[.!?]+$/,
                              "",
                            )}
                          </p>
                        </div>
                        <div className="flex justify-center pt-3 border-t border-[var(--c-tan)] flex-shrink-0">
                          <span className="text-[10px] uppercase tracking-wider text-[var(--c-gold)] font-bold">
                            {currentEntry.visualPrompt.mood}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Placeholder area if no image yet, to maintain balance or show empty state */
                    <div className="w-80 h-200 bg-white/30 p-3 shadow-lg transform rotate-1 hover:rotate-0 transition-all duration-500 border border-dashed border-[var(--c-gold)]/20 rounded-sm flex items-center justify-center">
                      <span className="text-[var(--c-gold)]/40 font-serif italic text-2xl">
                        ?
                      </span>
                    </div>
                  )}

                  {/* Generation Button */}
                  <button
                    onClick={generateMedia}
                    disabled={isGeneratingMedia || !localContent.trim()}
                    className="
                      w-full group relative px-6 py-4 bg-[var(--c-ink)] text-[var(--c-cream)] 
                      font-serif text-sm tracking-widest uppercase text-center
                      shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none
                      lift-on-hover press-on-click
                      overflow-hidden rounded-sm
                      flex items-center justify-center
                      -mt-4
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
