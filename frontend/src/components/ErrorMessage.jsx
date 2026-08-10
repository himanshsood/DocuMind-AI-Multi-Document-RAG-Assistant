import { AlertCircle } from "lucide-react";

export default function ErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
