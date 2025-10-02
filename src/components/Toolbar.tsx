import { useUploadContext } from "../context/useUploadContext";

export function Toolbar() {
  const { counts, overallProgress, actions } = useUploadContext();

  const hasQueuedItems = counts.pending > 0;
  const hasCompletedItems = counts.completed > 0;
  const hasActiveItems = counts.active > 0;
  const maxConcurrentUploads = 5;

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          onClick={actions.startAll}
          disabled={!hasQueuedItems}
          aria-label={`Start uploading ${counts.pending} files`}
        >
          Start Uploads
        </button>

        <div className="hidden md:flex items-center gap-3 text-sm min-w-0 flex-1 justify-center">
          <span className="text-gray-600 w-16 text-center">
            {counts.total > 0 ? `${counts.total} files` : ""}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">Slots:</span>
            <div className="flex items-center gap-1 w-8 justify-center">
              <span
                className={`font-medium tabular-nums ${counts.active > 0 ? "text-blue-600" : "text-gray-600"}`}
              >
                {counts.active}
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{maxConcurrentUploads}</span>
            </div>
          </div>

          <span className="text-amber-600 w-20 text-center">
            {counts.pending > 0 ? `• ${counts.pending} queued` : ""}
          </span>
        </div>

        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          onClick={actions.clearCompleted}
          disabled={!hasCompletedItems}
          aria-label={`Clear ${counts.completed} completed items`}
        >
          Clear Completed
        </button>
      </div>

      <div
        className={`transition-all duration-300 ${hasActiveItems ? "opacity-100 mb-0" : "opacity-0 h-0 overflow-hidden"}`}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Overall Progress
            </span>
            <span className="text-sm text-blue-700 tabular-nums w-10 text-right">
              {overallProgress}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
