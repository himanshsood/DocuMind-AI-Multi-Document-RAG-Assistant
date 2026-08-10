import { FileText, Trash2 } from "lucide-react";

import { formatDateTime, formatFileSize } from "../utils/format.js";

export default function FileCard({ document, onDelete }) {
  return (
    <article className="lift-hover flex items-start justify-between gap-4 rounded-lg border border-white/60 bg-white/55 p-4 backdrop-blur transition hover:border-sky hover:shadow-soft">
      <div className="flex min-w-0 gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-skySoft text-accent">
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">{document.filename}</h3>
          <p className="mt-1 text-xs uppercase tracking-normal text-muted">
            {document.file_type || "file"} · {formatFileSize(document.file_size)} ·{" "}
            {document.chunks_count} chunks
          </p>
          <p className="mt-1 text-xs text-muted">{formatDateTime(document.uploaded_at)}</p>
          <p className="mt-2 inline-flex rounded-md bg-skySoft px-2 py-1 text-xs font-medium text-accent">
            Ingested
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(document)}
        className="rounded-lg p-2 text-muted transition hover:bg-rose-50 hover:text-rose-600"
        aria-label={`Delete ${document.filename}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
}
