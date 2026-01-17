"use client";

import { format } from "date-fns"; // <--- Added this import
import { useJournal } from "@/app/hooks/useJournal"; // <--- Added this import
import DateNavigation from "./journal/DateNavigation";
import MediaSection from "./journal/MediaSection";
import JournalEditor from "./journal/JournalEditor";

export default function JournalBook() {
  const {
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
  } = useJournal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Book Shadow */}
          <div className="absolute inset-0 bg-black/20 rounded-lg transform rotate-1 translate-x-2 translate-y-2"></div>

          {/* Book */}
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden border-8 border-amber-100 dark:border-amber-900">
            {/* Book Binding */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-amber-600 to-amber-700 border-r-2 border-amber-800">
              <div className="absolute inset-y-0 left-2 w-0.5 bg-amber-800 opacity-50"></div>
              <div className="absolute inset-y-0 left-4 w-0.5 bg-amber-300 opacity-30"></div>
            </div>

            {/* Page Content */}
            <div className="pl-20 pr-12 py-12">
              <DateNavigation
                displayDate={displayDate}
                currentDate={currentDate}
                onNavigate={navigateDate}
              />

              <MediaSection
                entry={entry}
                content={content}
                isGenerating={isGeneratingMedia}
                onGenerate={generateMedia}
              />

              <JournalEditor content={content} onChange={setContent} />

              {/* Status Bar */}
              <div className="flex justify-between items-center mt-6 text-xs text-amber-600 dark:text-amber-400">
                <div>
                  {isSaving && <span>Saving...</span>}
                  {lastSaved && !isSaving && (
                    <span>Last saved: {format(lastSaved, "h:mm a")}</span>
                  )}
                </div>
                <div>{content.length} characters</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
