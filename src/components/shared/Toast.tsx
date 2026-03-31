"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  /** When true the toast is fading out (used for exit animation). */
  exiting: boolean;
}

interface ToastAPI {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastAPI | null>(null);

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 3000;
const EXIT_ANIMATION_MS = 300; // matches CSS transition duration

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let counter = 0;
function uid(): string {
  return `toast-${++counter}-${Date.now()}`;
}

const iconMap: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colorMap: Record<ToastType, string> = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-blue-600 text-white",
};

// ---------------------------------------------------------------------------
// Single toast item
// ---------------------------------------------------------------------------

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const Icon = iconMap[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg
        text-sm font-medium pointer-events-auto min-w-[280px] max-w-[420px]
        transition-all duration-300 ease-in-out
        ${colorMap[toast.type]}
        ${
          toast.exiting
            ? "opacity-0 translate-y-2 md:translate-y-0 md:translate-x-4"
            : "opacity-100 translate-y-0 md:translate-x-0"
        }
      `}
      style={{
        animation: toast.exiting
          ? undefined
          : "toast-slide-in 0.3s ease-out forwards",
      }}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1 break-words">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 rounded p-0.5 hover:bg-white/20 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Refs keep the timer map stable across renders.
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  // ---- dismiss helpers ----------------------------------------------------

  const startExit = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );

    // After the animation completes, remove from DOM.
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_MS);
  }, []);

  const scheduleDismiss = useCallback(
    (id: string) => {
      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        startExit(id);
      }, AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [startExit]
  );

  const dismiss = useCallback(
    (id: string) => {
      const timer = timersRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
      startExit(id);
    },
    [startExit]
  );

  // ---- add toast ----------------------------------------------------------

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = uid();
      setToasts((prev) => {
        // If we already have MAX_VISIBLE, drop the oldest ones.
        const next = [...prev, { id, type, message, exiting: false }];
        if (next.length > MAX_VISIBLE) {
          const overflow = next.slice(0, next.length - MAX_VISIBLE);
          overflow.forEach((t) => {
            const timer = timersRef.current.get(t.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(t.id);
            }
          });
          return next.slice(next.length - MAX_VISIBLE);
        }
        return next;
      });
      scheduleDismiss(id);
    },
    [scheduleDismiss]
  );

  // ---- stable API object --------------------------------------------------

  const api = useRef<ToastAPI>({
    success: (msg) => addToast("success", msg),
    error: (msg) => addToast("error", msg),
    info: (msg) => addToast("info", msg),
  });

  // Keep the ref callbacks in sync when addToast changes.
  useEffect(() => {
    api.current.success = (msg) => addToast("success", msg);
    api.current.error = (msg) => addToast("error", msg);
    api.current.info = (msg) => addToast("info", msg);
  }, [addToast]);

  // Clean up all timers on unmount.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={api.current}>
      {children}

      {/* Keyframes injected once */}
      <style jsx global>{`
        @keyframes toast-slide-in {
          0% {
            opacity: 0;
            transform: translateY(1rem);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (min-width: 768px) {
          @keyframes toast-slide-in {
            0% {
              opacity: 0;
              transform: translateX(1rem);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
        }
      `}</style>

      {/* Toast container */}
      {toasts.length > 0 && (
        <div
          aria-label="Notifications"
          className="
            fixed z-50 pointer-events-none
            bottom-20 left-1/2 -translate-x-1/2
            md:bottom-auto md:top-4 md:right-4 md:left-auto md:translate-x-0
            flex flex-col-reverse md:flex-col items-center md:items-end gap-2
            w-full md:w-auto px-4 md:px-0
          "
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
