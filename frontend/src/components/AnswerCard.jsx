import { SearchX, Sparkles } from "lucide-react";

import SourceList from "./SourceList.jsx";

const INSUFFICIENT_CONTEXT =
  "I could not find enough information in the uploaded documents to answer this.";

export default function AnswerCard({ answer, sources }) {
  if (!answer) {
    return null;
  }

  const noAnswer = answer === INSUFFICIENT_CONTEXT && sources.length === 0;

  return (
    <section className="glass-panel page-fade rounded-lg p-5">
      <div className="flex items-center gap-2">
        {noAnswer ? (
          <SearchX className="h-5 w-5 text-muted" aria-hidden="true" />
        ) : (
          <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
        )}
        <h2 className="text-lg font-semibold text-ink">
          {noAnswer ? "No answer found" : "Answer"}
        </h2>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-ink">
        {noAnswer
          ? "I couldn't find enough information in your uploaded documents to answer this question. Try asking something related to your documents."
          : answer}
      </p>
      <SourceList sources={sources} />
    </section>
  );
}
