import { ArrowRight, MessageSquareText, ShieldCheck, UploadCloud, Files } from "lucide-react";

const FEATURES = [
  {
    title: "Upload PDFs and text files",
    description: "Add documents incrementally without clearing your existing library.",
    icon: UploadCloud,
  },
  {
    title: "Ask grounded questions",
    description: "Answers are generated from retrieved document context with citations.",
    icon: MessageSquareText,
  },
  {
    title: "Manage your library",
    description: "Review metadata, remove stale files, and keep your index tidy.",
    icon: Files,
  },
  {
    title: "Clear safeguards",
    description: "Weak matches return an insufficient-context state instead of guesses.",
    icon: ShieldCheck,
  },
];

export default function Hero({ onStart, onDemo }) {
  return (
    <section className="py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent">Sky blue document intelligence</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
            Ask questions. Get answers from your documents.
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted">
            Upload your PDFs or text files, query your document library, and see
            exactly which sources were used.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accentDark"
            >
              Upload Documents
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onDemo}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-sky bg-white px-5 text-sm font-semibold text-accent transition hover:bg-skySoft"
            >
              Try Demo
            </button>
          </div>
        </div>
        <div className="glass-panel lift-hover rounded-lg p-5">
          <div className="rounded-lg bg-white/45 p-5">
            <p className="text-sm font-semibold text-accent">Typical workflow</p>
            <div className="mt-4 space-y-3 text-sm text-ink">
              <div className="rounded-lg bg-white/75 px-4 py-3">Upload documents</div>
              <div className="rounded-lg bg-white/75 px-4 py-3">Review library</div>
              <div className="rounded-lg bg-white/75 px-4 py-3">Ask questions</div>
              <div className="rounded-lg bg-white/75 px-4 py-3">Read cited answers</div>
            </div>
          </div>
      </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className="glass-panel lift-hover rounded-lg p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-skySoft text-accent">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-ink">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{feature.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
