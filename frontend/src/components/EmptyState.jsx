import { FilePlus2 } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="glass-soft rounded-lg border-dashed px-5 py-8 text-center">
      <FilePlus2 className="mx-auto h-8 w-8 text-muted" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-ink">No documents yet</h3>
      <p className="mt-1 text-sm text-muted">
        Upload a PDF or TXT file to start asking questions.
      </p>
    </div>
  );
}
