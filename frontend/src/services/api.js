const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const REQUEST_TIMEOUT_MS = 30000;
const LONG_REQUEST_TIMEOUT_MS = 300000;

async function request(path, options = {}) {
  const { timeoutMs = REQUEST_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      const message = payload?.detail || "Request failed. Please try again.";
      throw new Error(message);
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function checkHealth() {
  return request("/health");
}

export function getDocuments() {
  return request("/documents");
}

export function ingestDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  return request("/documents/ingest", {
    method: "POST",
    body: formData,
    timeoutMs: LONG_REQUEST_TIMEOUT_MS,
  });
}

export function deleteDocument(documentId) {
  return request(`/documents/${documentId}`, {
    method: "DELETE",
  });
}

export function summarizeDocument(documentId) {
  return request(`/documents/${documentId}/summary`, {
    method: "POST",
    timeoutMs: LONG_REQUEST_TIMEOUT_MS,
  });
}

export function askQuestion({
  question,
  topK,
  documentIds = [],
  fileTypes = [],
  uploadedAfter = "",
  uploadedBefore = "",
}) {
  return request("/ask", {
    method: "POST",
    timeoutMs: LONG_REQUEST_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      top_k: topK,
      document_ids: documentIds.length ? documentIds : null,
      file_types: fileTypes.length ? fileTypes : null,
      uploaded_after: uploadedAfter || null,
      uploaded_before: uploadedBefore || null,
    }),
  });
}
