import EmptyState from "./EmptyState.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import FileCard from "./FileCard.jsx";
import LoadingState from "./LoadingState.jsx";

function SkeletonCard() {
  return (
    <div className="glass-soft rounded-lg p-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-lg bg-skySoft" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-slate-100" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
          <div className="h-3 w-1/3 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function DocumentList({
  documents,
  isLoading,
  error,
  onDelete,
  onSummary,
  summaryStates,
  onAddDocuments,
}) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Documents ({documents.length})</h2>
          <p className="mt-1 text-sm text-muted">Add, review, and remove indexed files.</p>
        </div>
        <button
          type="button"
          onClick={onAddDocuments}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-sky bg-white px-4 text-sm font-semibold text-accent transition hover:bg-skySoft"
        >
          Add documents
        </button>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="space-y-3">
            <LoadingState label="Loading documents..." />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : documents.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {documents.map((document) => (
              <FileCard
                key={document.document_id}
                document={document}
                onDelete={onDelete}
                onSummary={onSummary}
                summaryState={summaryStates[document.document_id]}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}
