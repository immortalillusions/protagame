// hooks/useJournal.ts
import { useState, useEffect, useCallback } from "react";
import { format, addDays, subDays } from "date-fns";
import { JournalEntry, VisualPrompt } from "@/app/types/journal";

export function useJournal() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [content, setContent] = useState("");
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const dateStr = format(currentDate, "yyyy-MM-dd");
  const displayDate = format(currentDate, "MMMM d, yyyy");

  // Load entry
  const loadJournalEntry = useCallback(async () => {
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
  }, [dateStr]);

  // Initial load
  useEffect(() => {
    loadJournalEntry();
  }, [loadJournalEntry]);

  // Navigate dates
  const navigateDate = (direction: "prev" | "next") => {
    setCurrentDate((prev) =>
      direction === "prev" ? subDays(prev, 1) : addDays(prev, 1),
    );
  };

  // Generate Media
  const generateMedia = async () => {
    if (!content.trim()) return;

    setIsGeneratingMedia(true);
    try {
      const response = await fetch("/api/generate-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journalEntry: content.trim(), date: dateStr }),
      });

      const data = await response.json();

      if (data.success && data.visualPrompt) {
        const updatedEntry = {
          date: dateStr,
          content: content.trim(),
          visualPrompt: data.visualPrompt,
          mediaUrl: data.mediaUrl || entry?.mediaUrl,
        };

        // Save immediately
        const saveResponse = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEntry),
        });

        if (saveResponse.ok) {
          setLastSaved(new Date());
          await loadJournalEntry();
        }
      }
    } catch (error) {
      console.error("Media generation failed:", error);
    } finally {
      setIsGeneratingMedia(false);
    }
  };

  // Auto-save logic
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
        console.error("Auto-save failed:", error);
      } finally {
        setIsSaving(false);
      }
    };

    const timer = setTimeout(saveContent, 2000);
    return () => clearTimeout(timer);
  }, [content, dateStr, entry?.visualPrompt, entry?.mediaUrl]); // Removed isSaving from deps to avoid loops

  return {
    currentDate,
    displayDate,
    entry,
    content,
    setContent,
    isGeneratingMedia,
    isSaving,
    lastSaved,
    navigateDate,
    generateMedia,
  };
}
