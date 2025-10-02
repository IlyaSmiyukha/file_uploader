import { createContext } from "react";
import { useUploadManager } from "../state/uploadManager";

export const UploadManagerContext = createContext<ReturnType<
  typeof useUploadManager
> | null>(null);
