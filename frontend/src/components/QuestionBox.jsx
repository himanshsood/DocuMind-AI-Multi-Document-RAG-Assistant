import { Send } from "lucide-react";

import LoadingState from "./LoadingState.jsx";

const SUGGESTIONS = [
  "What is the leave policy?",
  "When can employees work remotely?",
  "What is the notice period?",
];

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
    <section className="glass-panel rounded-lg p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Ask your documents</h2>
          <p className="mt-1 text-sm text-muted">
            Search across every ingested document.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-muted">
          Top K
          <select
            value={topK}
            onChange={(event) => onTopKChange(Number(event.target.value))}
            className="min-h-10 rounded-lg border border-white/70 bg-white/70 px-3 text-sm text-ink"
          >
            {[3, 5, 7, 10].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasDocuments ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onQuestionChange(suggestion)}
              className="lift-hover rounded-lg border border-white/70 bg-white/55 px-3 py-2 text-left text-sm text-muted transition hover:border-sky hover:bg-white/80 hover:text-accent"
            >
              "{suggestion}"
            </button>
          ))}
        </div>
      ) : null}

      <textarea
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask something about your documents..."
        rows={5}
        className="mt-4 w-full resize-y rounded-lg border border-white/70 bg-white/75 px-4 py-3 text-base leading-7 text-ink transition placeholder:text-slate-400 focus:border-accent"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isAsking ? <LoadingState label="Searching your documents..." /> : <span />}
        <button
          type="button"
          onClick={onAsk}
          disabled={isAsking || !question.trim()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Ask
        </button>
      </div>
    </section>
  );
}
