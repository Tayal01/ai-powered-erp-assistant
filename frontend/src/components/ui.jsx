import { useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { CountUp } from "./motion.jsx";

export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function SurfaceCard({ children, className = "" }) {
  return (
    <article
      className={cn(
        "rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(16,34,39,0.06)]",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function SectionTitle({ title, subtitle, action = null }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorBanner({ message, action = null }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#ef8f5a]/30 bg-[#fff4ed] px-4 py-4 text-sm text-[#b65a29]">
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        {action}
      </div>
    </div>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  rawValue,
  format = (n) => n.toLocaleString(),
  chipClass = "bg-[#102227] text-white",
  detail,
}) {
  return (
    <SurfaceCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", chipClass)}>
          <Icon aria-hidden="true" size={20} />
        </div>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-ink">
        {typeof rawValue === "number" ? <CountUp format={format} value={rawValue} /> : value}
      </p>
      {detail ? <p className="mt-2 text-sm text-slate-500">{detail}</p> : null}
    </SurfaceCard>
  );
}

export function CompactStat({ label, value, icon: Icon, chipClass = "bg-[#f4efe8] text-[#102227]" }) {
  return (
    <SurfaceCard className="h-full p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{value}</p>
        </div>
        {Icon ? (
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", chipClass)}>
            <Icon aria-hidden="true" size={18} />
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  );
}

export function EmptyState({ message, className = "" }) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500",
        className,
      )}
    >
      {message}
    </div>
  );
}

export function SkeletonBlock({ className = "" }) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-200/70", className)} />;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  icon: Icon,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function handleKey(event) {
      if (event.key === "Escape") {
        onCancel?.();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#102227]/45 p-4 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-modal="true"
            className="w-full max-w-sm rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_30px_120px_rgba(16,34,39,0.28)]"
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            initial={{ opacity: 0, scale: 0.98, y: 14 }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            transition={{ duration: 0.2 }}
          >
            {Icon ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4efe8] text-[#102227]">
                <Icon aria-hidden="true" size={22} />
              </div>
            ) : null}
            <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
            {message ? <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p> : null}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={onCancel}
                type="button"
              >
                {cancelLabel}
              </button>
              <button
                autoFocus
                className="inline-flex items-center justify-center rounded-2xl bg-[#102227] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17333a]"
                onClick={onConfirm}
                type="button"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Modal({ open, title, subtitle, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#102227]/45 p-4 backdrop-blur-sm sm:items-center"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-[#f8faf9] shadow-[0_30px_120px_rgba(16,34,39,0.28)]"
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h3 className="text-xl font-semibold text-ink">{title}</h3>
                {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
              </div>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                onClick={onClose}
                type="button"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
