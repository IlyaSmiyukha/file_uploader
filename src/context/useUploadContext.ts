import { useContext } from "react";
import { UploadManagerContext } from "./UploadContext";

export function useUploadContext() {
  const context = useContext(UploadManagerContext);
  if (!context) {
    throw new Error(
      "useUploadContext must be used within UploadManagerProvider"
    );
  }
  return context;
}
