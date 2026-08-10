import { FileSearch, Home, MessageSquareText, Settings, UploadCloud } from "lucide-react";

import StatusIndicator from "./StatusIndicator.jsx";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "library", label: "Upload", icon: UploadCloud },
  { id: "chat", label: "Ask", icon: MessageSquareText },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Header({ apiStatus, activePage, onNavigate }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-white/35 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 text-accent shadow-soft transition hover:bg-skySoft hover:shadow-lg"
            aria-label="Go to home"
          >
            <FileSearch className="h-5 w-5" aria-hidden="true" />
          </button>
          <div>
            <p className="text-base font-semibold leading-5 text-ink">DocuMind</p>
            <p className="text-xs text-muted">Multi-Document RAG Assistant</p>
          </div>
        </div>
        <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-2 sm:w-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`group flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
                  activePage === item.id
                    ? "bg-white/80 text-accent shadow-soft"
                    : "text-muted hover:bg-white/55 hover:text-accent"
                }`}
                title={item.label}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="order-2 sm:order-3">
          <StatusIndicator status={apiStatus} />
        </div>
      </div>
    </header>
  );
}
