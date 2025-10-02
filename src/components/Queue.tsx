import { useUploadContext } from "../context/useUploadContext";
import { ItemRow } from "./ItemRow";

export function Queue() {
  const { items } = useUploadContext();

  return (
    <div className="w-full mx-auto max-h-[40vh] overflow-y-auto">
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No files uploaded yet. Drop files above to get started.</p>
        </div>
      )}
    </div>
  );
}
