interface JournalEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function JournalEditor({
  content,
  onChange,
}: JournalEditorProps) {
  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Dear diary, today..."
        className="w-full h-96 p-4 bg-transparent border-none outline-none resize-none font-serif text-lg leading-relaxed text-amber-900 dark:text-amber-100 placeholder-amber-400"
        style={{
          lineHeight: "1.8",
          backgroundImage: `repeating-linear-gradient(
            transparent,
            transparent 1.8rem,
            #d97706 1.8rem,
            #d97706 calc(1.8rem + 1px)
          )`,
        }}
      />
    </div>
  );
}
