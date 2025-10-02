import { z } from "zod";

export type UploadId = string;

export type UploadStatus =
  | "queued"
  | "gettingUrl"
  | "uploading"
  | "processing"
  | "notifying"
  | "done"
  | "failed"
  | "canceled";

export interface FileItem {
  id: UploadId;
  file: File;
  name: string;
  type: string;
  size: number;
}

export const GetUploadUrlInput = z.object({
  filename: z.string(),
  type: z.string(),
});

export const GetUploadUrlOutput = z.object({
  id: z.string(),
  uploadUrl: z.string().url(),
});

export const ProcessFileInput = z.object({
  id: z.string(),
});

export const ProcessFileOutput = z.object({
  id: z.string(),
  success: z.boolean(),
});

export const NotifyCompletionOutput = z.object({
  success: z.boolean(),
});
