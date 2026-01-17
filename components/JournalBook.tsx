'use client';

import { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import Image from 'next/image';

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
  const [content, setContent] = useState('');
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const displayDate = format(currentDate, 'MMMM d, yyyy');

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
        setContent('');
      }
    } catch (error) {
      console.error('Failed to load journal entry:', error);
      setEntry(null);
      setContent('');
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
          setContent('');
        }
      } catch (error) {
        console.error('Failed to load journal entry:', error);
        setEntry(null);
        setContent('');
      }
    };
    
    loadData();
  }, [dateStr]);

  const saveJournalEntry = async (includeVisualPrompt?: VisualPrompt) => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          content: content.trim(),
          visualPrompt: includeVisualPrompt || entry?.visualPrompt,
          mediaUrl: entry?.mediaUrl
        })
      });

      if (response.ok) {
        setLastSaved(new Date());
        await loadJournalEntry(); // Reload to get updated timestamps
      }
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const generateMedia = async () => {
    if (!content.trim()) {
      alert('Please write something in your journal first!');
      return;
    }

    setIsGeneratingMedia(true);
    try {
      const response = await fetch('/api/generate-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalEntry: content.trim(),
          date: dateStr
        })
      });

      const data = await response.json();
      
      if (data.success && data.visualPrompt) {
        // Save the journal entry with both visual prompt and media URL if available
        const updatedEntry = {
          date: dateStr,
          content: content.trim(),
          visualPrompt: data.visualPrompt,
          mediaUrl: data.mediaUrl || entry?.mediaUrl
        };

        // Save to backend
        const saveResponse = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEntry)
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
        alert(data.error || 'Failed to generate media');
      }
    } catch (error) {
      console.error('Media generation failed:', error);
      alert('Failed to generate media');
    } finally {
      setIsGeneratingMedia(false);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(subDays(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!content.trim()) return;

    const saveContent = async () => {
      if (isSaving) return;
      
      setIsSaving(true);
      try {
        const response = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: dateStr,
            content: content.trim(),
            visualPrompt: entry?.visualPrompt,
            mediaUrl: entry?.mediaUrl
          })
        });

        if (response.ok) {
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Failed to save journal entry:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Book Container */}
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
              
              {/* Date Navigation */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-2 text-amber-600 hover:text-amber-800 transition-colors"
                  title="Previous day"
                >
                  ← Previous
                </button>
                
                <h1 className="text-2xl font-serif text-amber-900 dark:text-amber-100">
                  {displayDate}
                </h1>
                
                <button
                  onClick={() => navigateDate('next')}
                  className="p-2 text-amber-600 hover:text-amber-800 transition-colors"
                  title="Next day"
                  disabled={format(currentDate, 'yyyy-MM-dd') >= format(new Date(), 'yyyy-MM-dd')}
                >
                  Next →
                </button>
              </div>

              {/* Media Generation Button */}
              <div className="mb-6">
                <button
                  onClick={generateMedia}
                  disabled={isGeneratingMedia || !content.trim()}
                  className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center font-bold text-lg"
                  title="Generate cinematic moment for this day"
                >
                  {isGeneratingMedia ? '⏳' : '🎬'}
                </button>
                
                {entry?.visualPrompt && (
                  <div className="mt-4 space-y-4">
                    {/* Generated Image */}
                    {entry.mediaUrl && (
                      <div className="relative rounded-lg overflow-hidden border-2 border-purple-200 dark:border-purple-800 shadow-lg">
                        <Image
                          src={entry.mediaUrl}
                          alt="Generated cinematic scene"
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover"
                          unoptimized={true} // For external URLs and local generated images
                          onError={(e) => {
                            console.error('Image failed to load:', entry.mediaUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Generated by FLUX.2 Klein
                        </div>
                      </div>
                    )}
                    
                    {/* Visual Prompt Details */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">
                        Cinematic Vision
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                        <strong>Scene:</strong> {entry.visualPrompt.visualPrompt}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                          {entry.visualPrompt.mood}
                        </span>
                        <span className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                          {entry.visualPrompt.colorPalette}
                        </span>
                        <span className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                          {entry.visualPrompt.cinematicStyle}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Journal Entry */}
              <div className="space-y-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Dear diary, today..."
                  className="w-full h-96 p-4 bg-transparent border-none outline-none resize-none font-serif text-lg leading-relaxed text-amber-900 dark:text-amber-100 placeholder-amber-400"
                  style={{ 
                    lineHeight: '1.8',
                    backgroundImage: `repeating-linear-gradient(
                      transparent,
                      transparent 1.8rem,
                      #d97706 1.8rem,
                      #d97706 calc(1.8rem + 1px)
                    )`,
                  }}
                />
              </div>

              {/* Status Bar */}
              <div className="flex justify-between items-center mt-6 text-xs text-amber-600 dark:text-amber-400">
                <div>
                  {isSaving && <span>Saving...</span>}
                  {lastSaved && !isSaving && (
                    <span>Last saved: {format(lastSaved, 'h:mm a')}</span>
                  )}
                </div>
                <div>
                  {content.length} characters
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
