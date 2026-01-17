import { format } from "date-fns";

interface DateNavigationProps {
  displayDate: string;
  currentDate: Date;
  onNavigate: (direction: "prev" | "next") => void;
}

export default function DateNavigation({
  displayDate,
  currentDate,
  onNavigate,
}: DateNavigationProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={() => onNavigate("prev")}
        className="p-2 text-amber-600 hover:text-amber-800 transition-colors"
        title="Previous day"
      >
        ← Previous
      </button>

      <h1 className="text-2xl font-serif text-amber-900 dark:text-amber-100">
        {displayDate}
      </h1>

      <button
        onClick={() => onNavigate("next")}
        className="p-2 text-amber-600 hover:text-amber-800 transition-colors"
        title="Next day"
        disabled={
          format(currentDate, "yyyy-MM-dd") >= format(new Date(), "yyyy-MM-dd")
        }
      >
        Next →
      </button>
    </div>
  );
}
