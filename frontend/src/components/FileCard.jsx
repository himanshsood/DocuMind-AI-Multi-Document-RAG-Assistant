import { FileText, ListChecks, Sparkles, Trash2 } from "lucide-react";

import { formatDateTime, formatFileSize } from "../utils/format.js";

export default function FileCard({ document, onDelete, onSummary, summaryState }) {
  const summary = summaryState?.data;
  const isSummarizing = summaryState?.status === "loading";
  const summaryError = summaryState?.error;

  return (
    <article className="lift-hover rounded-lg border border-white/60 bg-white/55 p-4 backdrop-blur transition hover:border-sky hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-skySoft text-accent">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink">{document.filename}</h3>
            <p className="mt-1 text-xs uppercase tracking-normal text-muted">
              {document.file_type || "file"} / {formatFileSize(document.file_size)} /{" "}
              {document.chunks_count} chunks
            </p>
            <p className="mt-1 text-xs text-muted">{formatDateTime(document.uploaded_at)}</p>
            <p className="mt-2 inline-flex rounded-md bg-skySoft px-2 py-1 text-xs font-medium text-accent">
              Ingested
            </p>
          </div>
        </div>

        <div className="flex flex-none items-center gap-1">
          <button
            type="button"
            onClick={() => onSummary(document)}
            disabled={isSummarizing}
            className="rounded-lg p-2 text-muted transition hover:bg-skySoft hover:text-accent disabled:cursor-wait disabled:opacity-60"
            aria-label={`Summarize ${document.filename}`}
            title="Summarize"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(document)}
            className="rounded-lg p-2 text-muted transition hover:bg-rose-50 hover:text-rose-600"
            aria-label={`Delete ${document.filename}`}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {isSummarizing ? (
        <p className="mt-4 rounded-lg bg-white/60 px-3 py-2 text-sm text-muted">
          Summarizing document...
        </p>
      ) : null}

      {summaryError ? (
        <p className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {summaryError}
        </p>
      ) : null}

      {summary ? (
        <div className="mt-4 rounded-lg border border-white/70 bg-white/55 p-3">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-accent" aria-hidden="true" />
            <h4 className="text-sm font-semibold text-ink">Summary</h4>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink">{summary.summary}</p>
          {summary.key_points?.length ? (
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {summary.key_points.map((point) => (
                <li key={point}>- {point}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
