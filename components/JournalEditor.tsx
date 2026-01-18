"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";

interface JournalEditorProps {
    initialContent: string;
    onContentChange: (content: string) => void;
    isSaving: boolean;
    lastSaved: Date | null;
}

const JournalEditor = React.memo(({
    initialContent,
    onContentChange,
    isSaving,
    lastSaved
}: JournalEditorProps) => {
    // Local state for immediate typing feedback
    const [localContent, setLocalContent] = useState(initialContent);

    // Ref to track if the update is coming from parent (new date) or local typing
    const isLocalUpdate = useRef(false);

    // Sync local state when parent changes initialContent (e.g. date navigation)
    useEffect(() => {
        if (!isLocalUpdate.current) {
            setLocalContent(initialContent);
        }
        // Reset flag after sync
        isLocalUpdate.current = false;
    }, [initialContent]);

    // Debounced parent update to prevent high-frequency re-renders of the heavy container
    useEffect(() => {
        const handler = setTimeout(() => {
            // Only notify parent if content is different? 
            // Actually parent needs to know eventually for saving.
            onContentChange(localContent);
        }, 500); // Update parent UI (buttons etc) every 500ms max

        return () => clearTimeout(handler);
    }, [localContent, onContentChange]);

    // Handle typing
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        isLocalUpdate.current = true;
        setLocalContent(newValue);
    }, []);

    return (
        <div className="flex-1 flex flex-col min-w-0 scrollbar-thin">
            <div className="flex-1 overflow-hidden">
                <textarea
                    value={localContent}
                    onChange={handleChange}
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
                        backgroundPositionX: "2rem",
                    }}
                />
            </div>

            {/* Status Bar inside the text column */}
            <div className="mt-4 flex items-center justify-between text-xs font-serif text-[var(--c-ink-light)] italic opacity-60">
                <span>
                    {isSaving
                        ? "Saving..."
                        : lastSaved
                            ? `Saved ${format(lastSaved, "h:mm a")}`
                            : "Click Visualize to save"}
                </span>
                <span className="pl-4 font-mono opacity-60">
                    {localContent.length} chars
                </span>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison to prevent re-renders unless strictly necessary
    return (
        prevProps.initialContent === nextProps.initialContent &&
        prevProps.isSaving === nextProps.isSaving &&
        prevProps.lastSaved === nextProps.lastSaved
    );
});

JournalEditor.displayName = "JournalEditor";

export default JournalEditor;
