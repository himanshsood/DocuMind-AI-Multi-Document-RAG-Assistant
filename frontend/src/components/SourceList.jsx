import { FileText } from "lucide-react";

export default function SourceList({ sources }) {
  if (!sources.length) {
    return null;
  }

  return (
    <div className="mt-5 border-t border-line pt-5">
      <h3 className="text-sm font-semibold text-ink">Sources</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {sources.map((source) => (
          <div
            key={`${source.filename}-${source.page_number}`}
            className="glass-soft flex gap-3 rounded-lg px-3 py-3"
          >
            <FileText className="h-5 w-5 flex-none text-accent" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{source.filename}</p>
              <p className="mt-1 text-xs text-muted">Page {source.page_number}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
