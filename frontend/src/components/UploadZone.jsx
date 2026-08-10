import { FileUp, Plus, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import UploadQueue from "./UploadQueue.jsx";

export default function UploadZone({
  selectedFiles,
  uploadStates,
  isUploading,
  onAddFiles,
  onRemoveFile,
  onUpload,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files) {
    onAddFiles(Array.from(files));
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Upload documents</h2>
          <p className="mt-1 text-sm text-muted">
            Drag, drop, and ingest documents incrementally.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accentDark"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add documents
        </button>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`mt-5 rounded-lg border border-dashed px-5 py-8 text-center transition ${
          isDragging ? "border-accent bg-white/75" : "border-white/70 bg-white/35"
        }`}
      >
        <UploadCloud className="mx-auto h-9 w-9 text-accent" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-ink">Drag and drop files here</p>
        <p className="mt-1 text-sm text-muted">PDF and TXT files only</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-sky bg-white px-4 text-sm font-semibold text-accent transition hover:bg-skySoft"
        >
          <FileUp className="h-4 w-4" aria-hidden="true" />
          Browse files
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.txt,application/pdf,text/plain"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
        className="hidden"
      />

      <UploadQueue
        files={selectedFiles}
        uploadStates={uploadStates}
        onRemove={onRemoveFile}
      />

      {selectedFiles.length ? (
        <button
          type="button"
          onClick={onUpload}
          disabled={isUploading}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <FileUp className="h-4 w-4" aria-hidden="true" />
          {isUploading ? "Processing document..." : "Upload selected files"}
        </button>
      ) : null}
    </section>
  );
}
