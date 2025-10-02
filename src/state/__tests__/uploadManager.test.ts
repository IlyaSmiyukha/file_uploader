import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUploadManager } from "../uploadManager";

vi.mock("../../api/mockApi", () => ({
  mockApi: {
    getUploadUrl: vi
      .fn()
      .mockResolvedValue({ id: "test-id", uploadUrl: "http://test.com" }),
    processFile: vi.fn().mockResolvedValue({ id: "test-id", success: true }),
    notifyCompletion: vi.fn().mockResolvedValue({ success: true }),
  },
  mockConfig: {
    latencyMs: [0, 0],
    failRate: 0,
    seed: 42,
    forceAllSuccess: true,
  },
}));

vi.mock("../../api/uploadFile", () => ({
  uploadFile: vi.fn().mockResolvedValue(undefined),
}));

describe("useUploadManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useUploadManager());

    expect(result.current.items).toEqual([]);
    expect(result.current.pending).toEqual([]);
    expect(result.current.active).toEqual([]);
    expect(result.current.completed).toEqual([]);
    expect(result.current.counts.total).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it("should add files to the queue", () => {
    const { result } = renderHook(() => useUploadManager());

    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    act(() => {
      result.current.actions.addFiles([mockFile]);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.pending).toHaveLength(1);
    expect(result.current.items[0]?.fileItem.name).toBe("test.txt");
    expect(result.current.items[0]?.status).toBe("queued");
  });

  it("should prevent duplicate files", () => {
    const { result } = renderHook(() => useUploadManager());

    const now = Date.now();
    const mockFile1 = new File(["test content"], "test.txt", {
      type: "text/plain",
      lastModified: now,
    });
    const mockFile2 = new File(["test content"], "test.txt", {
      type: "text/plain",
      lastModified: now,
    });

    act(() => {
      result.current.actions.addFiles([mockFile1]);
    });

    act(() => {
      result.current.actions.addFiles([mockFile2]);
    });

    expect(result.current.items).toHaveLength(1);
  });

  it("should start uploads when startAll is called", async () => {
    const { result } = renderHook(() => useUploadManager());

    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    act(() => {
      result.current.actions.addFiles([mockFile]);
      result.current.actions.startAll();
    });

    expect(result.current.isRunning).toBe(true);

    // Wait for async operations to complete
    await waitFor(() => {
      expect(result.current.active.length).toBeGreaterThan(0);
    });
  });

  it("should remove items from the queue", () => {
    const { result } = renderHook(() => useUploadManager());

    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    act(() => {
      result.current.actions.addFiles([mockFile]);
    });

    const itemId = result.current.items[0]?.id;
    expect(itemId).toBeDefined();

    act(() => {
      result.current.actions.remove(itemId!);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("should clear completed items", () => {
    const { result } = renderHook(() => useUploadManager());

    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    act(() => {
      result.current.actions.addFiles([mockFile]);
    });

    act(() => {
      const itemId = result.current.items[0]?.id;
      if (itemId) {
        result.current.actions.remove(itemId);
        result.current.actions.addFiles([mockFile]);
      }
    });

    act(() => {
      result.current.actions.clearCompleted();
    });

    expect(
      result.current.items.filter((item) =>
        ["done", "failed", "canceled"].includes(item.status)
      )
    ).toHaveLength(0);
  });
});
