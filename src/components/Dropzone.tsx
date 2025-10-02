import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadContext } from "../context/useUploadContext";

export function Dropzone() {
  const { actions } = useUploadContext();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        actions.addFiles(acceptedFiles);
      }
    },
    [actions]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      multiple: true,
    });

  const getDropzoneClasses = () => {
    let classes =
      "w-full max-w-2xl mx-auto mb-6 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ";

    if (isDragActive) {
      if (isDragReject) {
        classes += "border-red-400 bg-red-50 text-red-600";
      } else {
        classes += "border-blue-400 bg-blue-50 text-blue-600";
      }
    } else {
      classes +=
        "border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400 hover:bg-gray-100";
    }

    return classes;
  };

  return (
    <div
      {...getRootProps()}
      className={getDropzoneClasses()}
      role="button"
      tabIndex={0}
      aria-label="File upload area"
      aria-describedby="dropzone-description"
    >
      <input {...getInputProps()} className="sr-only" />
      <div id="dropzone-description">
        {isDragActive ? (
          isDragReject ? (
            <p className="text-lg">Some files will be rejected...</p>
          ) : (
            <p className="text-lg">Drop the files here...</p>
          )
        ) : (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Upload your files
            </h1>
            <p className="text-sm">
              Drag & drop files here, or{" "}
              <strong className="text-blue-600">click to select files</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
