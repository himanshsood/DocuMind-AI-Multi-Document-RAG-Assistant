import { CheckCircle2, Loader2, Trash2, XCircle } from "lucide-react";

import { formatFileSize } from "../utils/format.js";

export default function UploadQueue({ files, uploadStates, onRemove }) {
  if (!files.length) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      {files.map((file) => {
        const state = uploadStates[file.id] || { status: "queued" };
        const isBusy = state.status === "uploading";

        return (
          <div
            key={file.id}
            className="glass-soft flex items-start justify-between gap-3 rounded-lg px-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{file.name}</p>
              <p className="mt-1 text-xs text-muted">{formatFileSize(file.size)}</p>
              {state.message ? (
                <p
                  className={`mt-2 text-xs ${
                    state.status === "error" ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {state.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-none items-center gap-2">
              {isBusy ? (
                <Loader2 className="spinner h-4 w-4 text-accent" aria-hidden="true" />
              ) : state.status === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : state.status === "error" ? (
                <XCircle className="h-4 w-4 text-rose-600" aria-hidden="true" />
              ) : null}
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                disabled={isBusy}
                className="rounded-lg p-2 text-muted transition hover:bg-slate-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Remove ${file.name}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
