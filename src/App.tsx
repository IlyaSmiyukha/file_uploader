import { useEffect } from "react";
import { Dropzone } from "./components/Dropzone";
import { Queue } from "./components/Queue";
import { Toolbar } from "./components/Toolbar";
import { UploadManagerContext } from "./context/UploadContext";
import { useUploadManager } from "./state/uploadManager";

function App() {
  const uploadManager = useUploadManager(5);
  const { active } = uploadManager;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (active.length > 0) {
        e.preventDefault();
        e.returnValue =
          "You have active uploads. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [active.length]);

  return (
    <UploadManagerContext.Provider value={uploadManager}>
      <div className="bg-gray-50 w-full max-w-2xl py-8">
        <main className="container mx-auto px-4">
          <Dropzone />
          <Toolbar />
          <Queue />
        </main>
      </div>
    </UploadManagerContext.Provider>
  );
}

export default App;
