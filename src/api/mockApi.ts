import { z } from "zod";
import {
  GetUploadUrlInput,
  GetUploadUrlOutput,
  NotifyCompletionInput,
  NotifyCompletionOutput,
  ProcessFileInput,
  ProcessFileOutput,
} from "../types";

export const mockConfig = {
  latencyMs: [200, 1200] as [number, number],
  failRate: 0.15,
  seed: 42,
  forceAllSuccess: false,
};

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

const rng = new SeededRandom(mockConfig.seed);

function randomLatency(): number {
  const [min, max] = mockConfig.latencyMs;
  return min + rng.next() * (max - min);
}

function shouldFail(): boolean {
  if (mockConfig.forceAllSuccess) return false;
  return rng.next() < mockConfig.failRate;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockApi = {
  async getUploadUrl(
    input: z.infer<typeof GetUploadUrlInput>
  ): Promise<z.infer<typeof GetUploadUrlOutput>> {
    await sleep(randomLatency());

    if (shouldFail()) {
      throw new Error("Failed to get upload URL");
    }

    return {
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      uploadUrl: `https://mock-storage.example.com/upload/${input.filename}?token=mock_token`,
    };
  },

  async processFile(
    input: z.infer<typeof ProcessFileInput>
  ): Promise<z.infer<typeof ProcessFileOutput>> {
    await sleep(randomLatency());

    if (shouldFail()) {
      throw new Error("File processing failed");
    }

    return {
      id: input.id,
      success: true,
    };
  },

  async notifyCompletion(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: z.infer<typeof NotifyCompletionInput>
  ): Promise<z.infer<typeof NotifyCompletionOutput>> {
    await sleep(randomLatency());

    if (shouldFail()) {
      throw new Error("Failed to notify completion");
    }

    return {
      success: true,
    };
  },
};
