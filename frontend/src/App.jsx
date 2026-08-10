import {
  BarChart3,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Settings,
  UploadCloud,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AnswerCard from "./components/AnswerCard.jsx";
import DeleteConfirmModal from "./components/DeleteConfirmModal.jsx";
import DocumentList from "./components/DocumentList.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Notification from "./components/Notification.jsx";
import QuestionBox from "./components/QuestionBox.jsx";
import UploadZone from "./components/UploadZone.jsx";
import { formatDateTime, formatFileSize } from "./utils/format.js";
import {
  askQuestion,
  checkHealth,
  deleteDocument,
  getDocuments,
  ingestDocument,
} from "./services/api.js";

const PAGE_TITLES = {
  home: "Welcome",
  library: "Upload & Library",
  chat: "Chat",
  settings: "Settings",
};

function createQueuedFile(file) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    name: file.name,
    size: file.size,
  };
}

function friendlyError(error, fallback) {
  const message = error?.message || fallback;

  if (message.toLowerCase().includes("already been ingested")) {
    return "This document has already been uploaded.";
  }

  if (message.toLowerCase().includes("failed to fetch")) {
    return "Couldn't connect to the FastAPI server. Make sure the backend is running.";
  }

  return message;
}

function PageTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="page-fade mb-5">
      <p className="text-sm font-semibold text-accent">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>
    </div>
  );
}

function LibrarySidebar({ documents, activeCount }) {
  return (
    <aside className="glass-panel rounded-lg p-5 lg:sticky lg:top-24 lg:self-start">
      <h2 className="text-sm font-semibold text-ink">Document management</h2>
      <div className="mt-4 grid gap-3">
        <div className="rounded-lg bg-white/55 p-3">
          <p className="text-xs font-medium text-muted">Indexed documents</p>
          <p className="mt-1 text-2xl font-semibold text-accent">{documents.length}</p>
        </div>
        <div className="rounded-lg border border-white/60 bg-white/35 p-3">
          <p className="text-xs font-medium text-muted">Active in chat</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{activeCount}</p>
        </div>
      </div>
      <div className="mt-5 space-y-3 text-sm text-muted">
        <p className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />
          New uploads append to the library.
        </p>
        <p className="flex items-center gap-2">
          <UploadCloud className="h-4 w-4 text-accent" aria-hidden="true" />
          Duplicate files are handled by the backend.
        </p>
      </div>
    </aside>
  );
}

function DocumentSelector({ documents, selectedDocumentIds, onToggle }) {
  return (
    <aside className="glass-panel rounded-lg p-5 lg:sticky lg:top-24 lg:self-start">
      <h2 className="text-sm font-semibold text-ink">Query documents</h2>
      <p className="mt-1 text-xs text-muted">Select documents to focus retrieval.</p>
      <div className="mt-4 space-y-2">
        {documents.length ? (
          documents.map((document) => {
            const selected = selectedDocumentIds.includes(document.document_id);

            return (
              <label
                key={document.document_id}
                className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${
                  selected
                    ? "border-sky bg-white/70"
                    : "border-white/60 bg-white/35 hover:border-sky hover:bg-white/55"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggle(document.document_id)}
                  className="mt-1 h-4 w-4 accent-blue-900"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {document.filename}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {document.chunks_count} chunks
                  </span>
                </span>
              </label>
            );
          })
        ) : (
          <p className="rounded-lg bg-white/45 p-3 text-sm text-muted">
            Upload documents before narrowing chat scope.
          </p>
        )}
      </div>
    </aside>
  );
}

function ConversationHistory({ messages }) {
  if (!messages.length) {
    return (
      <div className="glass-panel page-fade rounded-lg border-dashed p-8 text-center">
        <MessageSquareText className="mx-auto h-9 w-9 text-accent" aria-hidden="true" />
        <h2 className="mt-3 text-base font-semibold text-ink">No conversation yet</h2>
        <p className="mt-1 text-sm text-muted">
          Ask a question to search your document library.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="space-y-3">
          <div className="ml-auto max-w-2xl rounded-lg bg-accent/95 px-4 py-3 text-sm leading-6 text-white shadow-soft">
            {message.question}
          </div>
          <AnswerCard answer={message.answer} sources={message.sources} />
        </div>
      ))}
    </div>
  );
}

function SettingsPage({ documents, apiStatus }) {
  const totalChunks = documents.reduce(
    (sum, document) => sum + Number(document.chunks_count || 0),
    0,
  );

  return (
    <div>
      <PageTitle
        eyebrow="Settings"
        title="Workspace preferences"
        subtitle="Review account basics, upload history, and local API configuration."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="glass-panel lift-hover rounded-lg p-5">
          <Settings className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-ink">Account info</h2>
          <p className="mt-2 text-sm text-muted">Local workspace</p>
          <p className="mt-1 text-sm text-muted">Backend status: {apiStatus}</p>
        </section>
        <section className="glass-panel lift-hover rounded-lg p-5">
          <BarChart3 className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-ink">Upload history</h2>
          <p className="mt-2 text-sm text-muted">{documents.length} documents indexed</p>
          <p className="mt-1 text-sm text-muted">{totalChunks} chunks available</p>
        </section>
        <section className="glass-panel lift-hover rounded-lg p-5">
          <Clock3 className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-ink">API settings</h2>
          <p className="mt-2 text-sm text-muted">Backend: http://127.0.0.1:8000</p>
          <p className="mt-1 text-sm text-muted">Frontend env: VITE_API_BASE_URL ready</p>
        </section>
      </div>

      <section className="glass-panel mt-5 rounded-lg p-5">
        <h2 className="text-lg font-semibold text-ink">Recent uploads</h2>
        <div className="mt-4 divide-y divide-line">
          {documents.length ? (
            documents.slice(0, 6).map((document) => (
              <div
                key={document.document_id}
                className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-ink">{document.filename}</span>
                <span className="text-muted">
                  {formatFileSize(document.file_size)} · {formatDateTime(document.uploaded_at)}
                </span>
              </div>
            ))
          ) : (
            <p className="py-4 text-sm text-muted">No uploads recorded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [apiStatus, setApiStatus] = useState("checking");
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStates, setUploadStates] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(5);
  const [conversation, setConversation] = useState([]);
  const [askError, setAskError] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  const latestSources = useMemo(() => {
    const latestMessage = conversation.at(-1);
    return new Set((latestMessage?.sources || []).map((source) => source.filename));
  }, [conversation]);

  async function refreshHealth() {
    setApiStatus("checking");

    try {
      await checkHealth();
      setApiStatus("connected");
    } catch {
      setApiStatus("offline");
    }
  }

  async function refreshDocuments() {
    setDocumentsLoading(true);
    setDocumentsError("");

    try {
      const nextDocuments = await getDocuments();
      const normalizedDocuments = Array.isArray(nextDocuments) ? nextDocuments : [];
      setDocuments(normalizedDocuments);
      setSelectedDocumentIds((currentIds) => {
        const availableIds = new Set(
          normalizedDocuments.map((document) => document.document_id),
        );
        return currentIds.filter((documentId) => availableIds.has(documentId));
      });
    } catch (error) {
      setDocumentsError(
        friendlyError(error, "Couldn't load documents. Please try again."),
      );
    } finally {
      setDocumentsLoading(false);
    }
  }

  useEffect(() => {
    refreshHealth();
    refreshDocuments();

    const intervalId = window.setInterval(refreshHealth, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  function navigate(page) {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAddFiles(files) {
    const validFiles = files.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      return extension === "pdf" || extension === "txt";
    });
    const rejectedFiles = files.filter((file) => !validFiles.includes(file));

    setSelectedFiles((currentFiles) => [
      ...currentFiles,
      ...validFiles.map(createQueuedFile),
    ]);

    if (rejectedFiles.length) {
      setNotification({
        type: "error",
        message:
          rejectedFiles.length === 1
            ? "Only PDF and TXT files are supported."
            : `${rejectedFiles.length} files were skipped. Only PDF and TXT files are supported.`,
      });
    }
  }

  function handleRemoveFile(fileId) {
    setSelectedFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
    setUploadStates((currentStates) => {
      const nextStates = { ...currentStates };
      delete nextStates[fileId];
      return nextStates;
    });
  }

  async function handleUpload() {
    if (!selectedFiles.length || isUploading) {
      return;
    }

    setIsUploading(true);
    let successfulUploads = 0;
    const successfulFileIds = new Set();

    for (const queuedFile of selectedFiles) {
      setUploadStates((currentStates) => ({
        ...currentStates,
        [queuedFile.id]: { status: "uploading", message: "Processing document..." },
      }));

      try {
        await ingestDocument(queuedFile.file);
        successfulUploads += 1;
        successfulFileIds.add(queuedFile.id);
        setUploadStates((currentStates) => ({
          ...currentStates,
          [queuedFile.id]: { status: "success", message: "Indexed successfully." },
        }));
      } catch (error) {
        setUploadStates((currentStates) => ({
          ...currentStates,
          [queuedFile.id]: {
            status: "error",
            message: friendlyError(
              error,
              "Couldn't process this document. Please check the file and try again.",
            ),
          },
        }));
      }
    }

    if (successfulUploads) {
      await refreshDocuments();
      setNotification({
        type: "success",
        message:
          successfulUploads === 1
            ? "Document indexed successfully."
            : `${successfulUploads} documents indexed successfully.`,
      });
      setSelectedFiles((currentFiles) =>
        currentFiles.filter((file) => !successfulFileIds.has(file.id)),
      );
      setUploadStates((currentStates) => {
        const nextStates = { ...currentStates };

        for (const fileId of successfulFileIds) {
          delete nextStates[fileId];
        }

        return nextStates;
      });
    }

    setIsUploading(false);
  }

  async function handleAsk() {
    if (!question.trim() || isAsking) {
      return;
    }

    const askedQuestion = question.trim();
    setIsAsking(true);
    setAskError("");

    try {
      const response = await askQuestion(askedQuestion, topK, selectedDocumentIds);
      setConversation((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          question: askedQuestion,
          answer: response.answer || "",
          sources: Array.isArray(response.sources) ? response.sources : [],
        },
      ]);
      setQuestion("");
    } catch (error) {
      setAskError(friendlyError(error, "Couldn't answer this question. Please try again."));
    } finally {
      setIsAsking(false);
    }
  }

  function toggleSelectedDocument(documentId) {
    setSelectedDocumentIds((currentIds) =>
      currentIds.includes(documentId)
        ? currentIds.filter((currentId) => currentId !== documentId)
        : [...currentIds, documentId],
    );
  }

  async function handleConfirmDelete() {
    if (!documentToDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteDocument(documentToDelete.document_id);
      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (document) => document.document_id !== documentToDelete.document_id,
        ),
      );
      setSelectedDocumentIds((currentIds) =>
        currentIds.filter((documentId) => documentId !== documentToDelete.document_id),
      );

      if (latestSources.has(documentToDelete.filename)) {
        setConversation([]);
      }

      setNotification({ type: "success", message: "Document deleted." });
      setDocumentToDelete(null);
      await refreshDocuments();
    } catch (error) {
      setDeleteError(friendlyError(error, "Couldn't delete this document. Please try again."));
    } finally {
      setIsDeleting(false);
    }
  }

  function renderPage() {
    if (activePage === "home") {
      return (
        <Hero
          onStart={() => navigate("library")}
          onDemo={() => {
            setQuestion("What is the leave policy?");
            navigate("chat");
          }}
        />
      );
    }

    if (activePage === "library") {
      return (
        <div className="page-fade">
          <PageTitle
            eyebrow={PAGE_TITLES.library}
            title="Upload and organize your document library"
            subtitle="Add documents in batches, monitor ingestion status, and keep your searchable knowledge base clean."
          />
          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <LibrarySidebar
              documents={documents}
              activeCount={selectedDocumentIds.length || documents.length}
            />
            <div className="space-y-5">
              <UploadZone
                selectedFiles={selectedFiles}
                uploadStates={uploadStates}
                isUploading={isUploading}
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveFile}
                onUpload={handleUpload}
              />
              <DocumentList
                documents={documents}
                isLoading={documentsLoading}
                error={documentsError}
                onDelete={setDocumentToDelete}
                onAddDocuments={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              />
            </div>
          </div>
        </div>
      );
    }

    if (activePage === "chat") {
      return (
        <div className="page-fade">
          <PageTitle
            eyebrow={PAGE_TITLES.chat}
            title="Chat with your documents"
            subtitle="Choose a focused set of documents or search across the full library."
          />
          <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <DocumentSelector
              documents={documents}
              selectedDocumentIds={selectedDocumentIds}
              onToggle={toggleSelectedDocument}
            />
            <div className="flex min-h-[680px] flex-col gap-5">
              <div className="flex-1">
                <ConversationHistory messages={conversation} />
              </div>
              <div className="sticky bottom-4">
                <QuestionBox
                  question={question}
                  topK={topK}
                  hasDocuments={documents.length > 0}
                  isAsking={isAsking}
                  onQuestionChange={setQuestion}
                  onTopKChange={setTopK}
                  onAsk={handleAsk}
                />
                <div className="mt-3">
                  <ErrorMessage message={askError} />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="page-fade">
        <SettingsPage documents={documents} apiStatus={apiStatus} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-ink">
      <Header apiStatus={apiStatus} activePage={activePage} onNavigate={navigate} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{renderPage()}</main>

      <DeleteConfirmModal
        document={documentToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onCancel={() => {
          if (!isDeleting) {
            setDocumentToDelete(null);
            setDeleteError("");
          }
        }}
        onConfirm={handleConfirmDelete}
      />

      <Notification notification={notification} onDismiss={() => setNotification(null)} />
    </div>
  );
}
