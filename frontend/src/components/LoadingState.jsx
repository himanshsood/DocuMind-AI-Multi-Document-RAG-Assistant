import { Loader2 } from "lucide-react";

export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <Loader2 className="spinner h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
