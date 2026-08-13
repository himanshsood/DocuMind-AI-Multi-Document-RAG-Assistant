import { Send } from "lucide-react";

import LoadingState from "./LoadingState.jsx";

export default function QuestionBox({
  question,
  topK,
  hasDocuments,
  isAsking,
  onQuestionChange,
  onTopKChange,
  onAsk,
}) {
  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      onAsk();
    }
  }

  return (
    <section className="glass-panel rounded-lg p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <textarea
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            hasDocuments
              ? "Ask something about your documents..."
              : "Upload a document before asking..."
          }
          rows={2}
          className="min-h-[52px] flex-1 resize-none rounded-lg border border-white/70 bg-white/80 px-3 py-2 text-sm leading-5 text-ink transition placeholder:text-slate-400 focus:border-accent"
        />

        <div className="flex items-center justify-between gap-3 sm:flex-none">
          <label className="flex items-center gap-2 text-xs font-medium text-muted">
            Top K
            <select
              value={topK}
              onChange={(event) => onTopKChange(Number(event.target.value))}
              className="min-h-9 rounded-lg border border-white/70 bg-white/80 px-2 text-sm text-ink"
            >
              {[3, 5, 7, 10].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onAsk}
            disabled={isAsking || !question.trim() || !hasDocuments}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Ask
          </button>
        </div>
      </div>

      {isAsking ? (
        <div className="mt-2">
          <LoadingState label="Searching..." />
        </div>
      ) : null}
    </section>
  );
}
