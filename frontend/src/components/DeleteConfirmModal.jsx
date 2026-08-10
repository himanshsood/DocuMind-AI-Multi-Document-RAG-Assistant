import { AlertTriangle, Loader2, X } from "lucide-react";

import ErrorMessage from "./ErrorMessage.jsx";

export default function DeleteConfirmModal({
  document,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}) {
  if (!document) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
      <div className="glass-panel page-fade w-full max-w-md rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">Delete document?</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Are you sure you want to delete "{document.filename}"? Its indexed
                content will no longer be available for questions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg p-2 text-muted transition hover:bg-slate-100 hover:text-ink disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="min-h-10 rounded-lg border border-white/70 bg-white/65 px-4 text-sm font-semibold text-ink transition hover:bg-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {isDeleting ? <Loader2 className="spinner h-4 w-4" aria-hidden="true" /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
