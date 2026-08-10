import { AlertCircle, CheckCircle2, X } from "lucide-react";

export default function Notification({ notification, onDismiss }) {
  if (!notification?.message) {
    return null;
  }

  const isError = notification.type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 max-w-sm rounded-lg border bg-white p-4 text-sm shadow-soft ${
        isError
          ? "border-rose-200 text-rose-800"
          : "border-emerald-200 text-emerald-800"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
        <p className="flex-1">{notification.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className={`rounded-lg p-1 transition ${
            isError
              ? "text-rose-700 hover:bg-rose-50"
              : "text-emerald-700 hover:bg-emerald-50"
          }`}
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
