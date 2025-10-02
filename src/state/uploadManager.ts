import { useCallback, useEffect, useRef, useState } from "react";
import { mockApi } from "../api/mockApi";
import { uploadFile } from "../api/uploadFile";
import type { FileItem, UploadId, UploadStatus } from "../types";
import { expBackoff } from "../utils/backoff";
import { uuid } from "../utils/ids";

export interface UploadItem {
  id: UploadId;
  fileItem: FileItem;
  status: UploadStatus;
  progress: number;
  error?: string | undefined;
  abortController?: AbortController | undefined;
  retryAttempts: number;
}

function createFileItem(file: File): FileItem {
  return {
    id: uuid(),
    file,
    name: file.name,
    type: file.type,
    size: file.size,
  };
}

function isDuplicateFile(file: File, existingItems: UploadItem[]): boolean {
  return existingItems.some(
    (item) =>
      item.fileItem.name === file.name &&
      item.fileItem.size === file.size &&
      item.fileItem.file.lastModified === file.lastModified
  );
}

async function processUpload(
  item: UploadItem,
  updateItem: (id: UploadId, updates: Partial<UploadItem>) => void
): Promise<void> {
  try {
    updateItem(item.id, { status: "gettingUrl" });
    const urlResult = await mockApi.getUploadUrl({
      filename: item.fileItem.name,
      type: item.fileItem.type,
    });

    updateItem(item.id, { status: "uploading", progress: 0 });
    await uploadFile(
      item.fileItem.file,
      urlResult.uploadUrl,
      (progress) => updateItem(item.id, { progress }),
      item.abortController?.signal
    );

    updateItem(item.id, { status: "processing", progress: 100 });

    let processAttempts = 0;
    const maxProcessAttempts = 3;

    while (processAttempts < maxProcessAttempts) {
      try {
        if (processAttempts > 0) {
          await expBackoff(processAttempts);
        }

        await mockApi.processFile({ id: urlResult.id });
        break;
      } catch (error) {
        processAttempts++;
        if (processAttempts >= maxProcessAttempts) {
          throw error;
        }
      }
    }

    updateItem(item.id, { status: "notifying" });
    await mockApi.notifyCompletion({ id: urlResult.id, status: "success" });

    updateItem(item.id, { status: "done" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    if (error instanceof DOMException && error.name === "AbortError") {
      updateItem(item.id, { status: "canceled", error: "Upload canceled" });
    } else {
      updateItem(item.id, { status: "failed", error: errorMessage });
    }
  }
}

export function useUploadManager(concurrency: number = 5) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const processingQueue = useRef<Set<UploadId>>(new Set());

  const updateItem = useCallback(
    (id: UploadId, updates: Partial<UploadItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const addFiles = useCallback(
    (files: File[]) => {
      const newItems: UploadItem[] = [];

      for (const file of files) {
        if (!isDuplicateFile(file, items)) {
          const fileItem = createFileItem(file);

          newItems.push({
            id: fileItem.id,
            fileItem,
            status: "queued",
            progress: 0,
            retryAttempts: 0,
          });
        }
      }

      setItems((prev) => [...prev, ...newItems]);
    },
    [items]
  );

  const startAll = useCallback(() => {
    setIsRunning(true);
  }, []);

  const cancel = useCallback((id: UploadId) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          item.abortController?.abort();
          return { ...item, status: "canceled" as UploadStatus };
        }
        return item;
      })
    );
    processingQueue.current.delete(id);
  }, []);

  const retry = useCallback((id: UploadId, mode: "step" | "all") => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (mode === "all") {
            return {
              ...item,
              status: "queued" as UploadStatus,
              progress: 0,
              retryAttempts: 0,
              abortController: undefined,
              error: undefined,
            };
          } else {
            return {
              ...item,
              status: "queued" as UploadStatus,
              abortController: undefined,
              error: undefined,
            };
          }
        }
        return item;
      })
    );
  }, []);

  const remove = useCallback((id: UploadId) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.abortController) {
        item.abortController.abort();
      }
      return prev.filter((i) => i.id !== id);
    });
    processingQueue.current.delete(id);
  }, []);

  const clearCompleted = useCallback(() => {
    setItems((prev) =>
      prev.filter(
        (item) => !["done", "failed", "canceled"].includes(item.status)
      )
    );
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const queuedItems = items.filter((item) => item.status === "queued");
    const activeItems = items.filter((item) =>
      ["gettingUrl", "uploading", "processing", "notifying"].includes(
        item.status
      )
    );

    if (queuedItems.length === 0 && activeItems.length === 0) {
      setIsRunning(false);
      return;
    }

    const slotsAvailable = concurrency - activeItems.length;
    const itemsToStart = queuedItems.slice(0, slotsAvailable);

    itemsToStart.forEach((item) => {
      if (!processingQueue.current.has(item.id)) {
        processingQueue.current.add(item.id);

        const abortController = new AbortController();
        updateItem(item.id, { abortController });

        processUpload(item, updateItem).finally(() => {
          processingQueue.current.delete(item.id);
        });
      }
    });
  }, [items, isRunning, concurrency, updateItem]);

  const pending = items.filter((item) => item.status === "queued");
  const active = items.filter((item) =>
    ["gettingUrl", "uploading", "processing", "notifying"].includes(item.status)
  );
  const completed = items.filter((item) =>
    ["done", "failed", "canceled"].includes(item.status)
  );

  const overallProgress =
    active.length > 0
      ? Math.round(
          active.reduce((sum, item) => sum + item.progress, 0) / active.length
        )
      : 0;

  const counts = {
    pending: pending.length,
    active: active.length,
    completed: completed.length,
    total: items.length,
  };

  return {
    items,
    pending,
    active,
    completed,
    counts,
    overallProgress,
    isRunning,
    actions: {
      addFiles,
      startAll,
      cancel,
      retry,
      remove,
      clearCompleted,
    },
  };
}
