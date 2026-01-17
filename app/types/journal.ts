// app/types/journal.ts
export interface VisualPrompt {
  visualPrompt: string;
  mood: string;
  colorPalette: string;
  cinematicStyle: string;
  duration: string;
}

export interface JournalEntry {
  date: string;
  content: string;
  visualPrompt?: VisualPrompt;
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
}
