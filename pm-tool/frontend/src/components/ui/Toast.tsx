import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Tone = "success" | "error";
interface ToastItem { id: number; message: string; tone: Tone; }
interface ToastApi { toast: (message: string, tone?: Tone) => void; }

const ToastCtx = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex flex-col gap-2" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={`tick-frame rounded-sm border px-3 py-2 text-sm shadow-pop ${
              t.tone === "success" ? "border-pine/40 bg-surface text-pine" : "border-brick/40 bg-surface text-brick"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
