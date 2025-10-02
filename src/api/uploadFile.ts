import { mockConfig } from "./mockApi";

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

const uploadRng = new SeededRandom(mockConfig.seed + 1000);

export async function uploadFile(
  file: File,
  _url: string,
  onProgress: (progress: number) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("AbortError", "AbortError"));
      return;
    }

    let progress = 0;
    onProgress(0);

    const totalChunks = Math.max(
      10,
      Math.min(100, Math.floor(file.size / 10000))
    );
    const chunkSize = 100 / totalChunks;

    const baseInterval = 50 + uploadRng.next() * 50;

    let intervalId: number | null = null;
    let aborted = false;

    const cleanup = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleAbort = () => {
      aborted = true;
      cleanup();
      reject(new DOMException("AbortError", "AbortError"));
    };

    signal?.addEventListener("abort", handleAbort);

    const shouldFail =
      !mockConfig.forceAllSuccess && uploadRng.next() < mockConfig.failRate;
    const failAt = shouldFail ? 30 + uploadRng.next() * 50 : 101;

    intervalId = setInterval(() => {
      if (aborted) return;

      progress += chunkSize + (uploadRng.next() - 0.5) * chunkSize * 0.5;
      progress = Math.min(progress, 100);

      if (progress >= failAt && shouldFail) {
        cleanup();
        signal?.removeEventListener("abort", handleAbort);
        reject(new Error("Mock upload failed"));
        return;
      }

      onProgress(Math.floor(progress));

      if (progress >= 100) {
        cleanup();
        signal?.removeEventListener("abort", handleAbort);
        resolve();
      }
    }, baseInterval);
  });
}
