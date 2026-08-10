import { Circle } from "lucide-react";

export default function StatusIndicator({ status }) {
  const connected = status === "connected";
  const checking = status === "checking";

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted">
      <Circle
        aria-hidden="true"
        className={`h-3 w-3 ${
          connected
            ? "fill-emerald-500 text-emerald-500"
            : checking
              ? "fill-amber-400 text-amber-400"
              : "fill-rose-500 text-rose-500"
        }`}
      />
      <span>{connected ? "Connected" : checking ? "Checking" : "Offline"}</span>
    </div>
  );
}
