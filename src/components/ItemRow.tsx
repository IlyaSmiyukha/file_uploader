import { useUploadContext } from "../context/useUploadContext";
import type { UploadItem } from "../state/uploadManager";

interface ItemRowProps {
  item: UploadItem;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getStatusColor(status: string): string {
  switch (status) {
    case "queued":
      return "text-gray-600 bg-gray-100";
    case "gettingUrl":
    case "uploading":
    case "processing":
    case "notifying":
      return "text-blue-600 bg-blue-100";
    case "done":
      return "text-green-600 bg-green-100";
    case "failed":
      return "text-red-600 bg-red-100";
    case "canceled":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "queued":
      return "Queued";
    case "gettingUrl":
      return "Getting URL";
    case "uploading":
      return "Uploading";
    case "processing":
      return "Processing";
    case "notifying":
      return "Notifying";
    case "done":
      return "Done";
    case "failed":
      return "Failed";
    case "canceled":
      return "Canceled";
    default:
      return status;
  }
}

export function ItemRow({ item }: ItemRowProps) {
  const { actions } = useUploadContext();

  const { id, fileItem, status, progress, error } = item;
  const { name, size } = fileItem;

  const canCancel = [
    "queued",
    "gettingUrl",
    "uploading",
    "processing",
    "notifying",
  ].includes(status);
  const canRetry = status === "failed";
  const canRemove = ["done", "failed", "canceled"].includes(status);
  const showProgress = ["uploading", "processing"].includes(status);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-end justify-between">
        <div className="flex-1 min-w-0 mr-4">
          <h4
            className="text-sm font-medium text-gray-900 truncate"
            title={name}
          >
            {name}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-gray-500 w-16 whitespace-nowrap">
              {formatFileSize(size)}
            </p>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-20 justify-center whitespace-nowrap ${getStatusColor(status)}`}
            >
              {getStatusLabel(status)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mr-4 md:w-36">
          {showProgress ? (
            <>
              <div className="hidden md:flex w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 w-8 tabular-nums text-right">
                {progress}%
              </span>
            </>
          ) : (
            <div className="w-32"></div>
          )}
        </div>

        <div className="flex items-center gap-2 w-32 justify-end">
          {canRetry && (
            <button
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
              onClick={() => actions.retry(id, "all")}
              aria-label={`Retry upload for ${name}`}
            >
              Retry
            </button>
          )}

          {canCancel && (
            <button
              className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
              onClick={() => actions.cancel(id)}
              aria-label={`Cancel upload for ${name}`}
            >
              Cancel
            </button>
          )}

          {canRemove && (
            <button
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
              onClick={() => actions.remove(id)}
              aria-label={`Remove ${name} from list`}
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <div className="h-4 mt-1">
        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
