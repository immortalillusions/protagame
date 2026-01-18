"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isAfter,
} from "date-fns";

interface CalendarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  entriesWithContent?: Set<string>; // Optional: dates that have journal entries
}

export default function Calendar({
  currentDate,
  onDateSelect,
  entriesWithContent,
}: CalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(currentDate);
  const calendarRef = useRef<HTMLDivElement>(null);

  const today = new Date();

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update view month when currentDate changes
  useEffect(() => {
    setViewMonth(currentDate);
  }, [currentDate]);

  const handleDateClick = (date: Date) => {
    // Don't allow selecting future dates
    if (isAfter(date, today)) return;

    onDateSelect(date);
    setIsOpen(false);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4 px-2">
      <button
        onClick={() => setViewMonth(subMonths(viewMonth, 1))}
        className="p-1 hover:bg-[var(--c-gold)]/20 rounded transition-colors text-[var(--c-ink-light)]"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <h3 className="font-serif text-lg text-[var(--c-ink)] font-semibold">
        {format(viewMonth, "MMMM yyyy")}
      </h3>

      <button
        onClick={() => setViewMonth(addMonths(viewMonth, 1))}
        className="p-1 hover:bg-[var(--c-gold)]/20 rounded transition-colors text-[var(--c-ink-light)]"
        disabled={isSameMonth(viewMonth, today)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={isSameMonth(viewMonth, today) ? "opacity-30" : ""}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );

  const renderDays = () => {
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-[var(--c-ink-light)]/60 py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dateStr = format(day, "yyyy-MM-dd");
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = isSameDay(day, currentDate);
        const isToday = isSameDay(day, today);
        const isFuture = isAfter(day, today);
        const hasEntry = entriesWithContent?.has(dateStr);

        days.push(
          <button
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
            disabled={isFuture}
            className={`
              relative w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-all
              ${!isCurrentMonth ? "text-[var(--c-ink-light)]/30" : "text-[var(--c-ink)]"}
              ${isSelected ? "bg-[var(--c-gold)] text-white font-bold shadow-md" : ""}
              ${isToday && !isSelected ? "ring-2 ring-[var(--c-gold)]/50" : ""}
              ${isFuture ? "opacity-30 cursor-not-allowed" : "hover:bg-[var(--c-gold)]/20 cursor-pointer"}
              ${hasEntry && !isSelected ? "font-semibold" : ""}
            `}
          >
            {format(day, "d")}
            {/* Dot indicator for entries */}
            {hasEntry && !isSelected && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--c-gold)] rounded-full" />
            )}
          </button>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>,
      );
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div ref={calendarRef} className="relative z-[70]">
      {/* Calendar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed right-6 top-6 z-[60] flex items-center justify-center w-14 h-14 
          rounded-full shadow-xl border-4 border-white/50 transition-all group pointer-events-auto
          ${isOpen ? "bg-amber-600 text-white" : "bg-white/80 text-amber-800 hover:bg-amber-100"}
        `}
        title="Open Calendar"
      >
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
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>

        {/* Tooltip */}
        <span className="absolute right-full mr-4 bg-black/75 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {isOpen ? "Close Calendar" : "Open Calendar"}
        </span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="fixed right-6 top-24 z-[65] pointer-events-auto">
          <div className="bg-[#fdf6e9] border-2 border-amber-200 shadow-2xl rounded-xl p-4 w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header with month navigation */}
            {renderHeader()}

            {/* Day names */}
            {renderDays()}

            {/* Calendar grid */}
            {renderCells()}

            {/* Quick actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-amber-200">
              <button
                onClick={() => {
                  onDateSelect(today);
                  setIsOpen(false);
                }}
                className="flex-1 py-2 px-3 text-sm font-serif bg-[var(--c-gold)]/20 text-[var(--c-ink)] rounded-lg hover:bg-[var(--c-gold)]/30 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="py-2 px-3 text-sm font-serif text-[var(--c-ink-light)] hover:bg-amber-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}