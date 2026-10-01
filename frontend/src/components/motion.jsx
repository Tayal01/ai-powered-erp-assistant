import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

/**
 * KPI count-up. Animates a raw number, formats every frame with the SAME
 * formatter the dashboard passes (formatCurrency / formatCompactNumber).
 * Non-numeric value (e.g. "..." while loading) renders as-is.
 */
export function CountUp({ value, format = (n) => n.toLocaleString(), duration = 1.1, delay = 0 }) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (latest) => format(latest));
  const numeric = typeof value === "number" && Number.isFinite(value);

  useEffect(() => {
    if (!numeric) return undefined;
    if (reduced) {
      mv.set(value);
      return undefined;
    }
    const controls = animate(mv, value, { duration, delay, ease: EASE_OUT_EXPO });
    return controls.stop;
  }, [value, numeric, reduced, duration, delay, mv]);

  if (!numeric) return <span>{value}</span>;
  return <motion.span>{text}</motion.span>;
}

/**
 * Numeric count-up hook for SVG text (donut center total), where a motion.span
 * can't be used. Returns a number that tweens 0 -> target.
 */
export function useCountUp(target, ms = 900) {
  const reduced = useReducedMotion();
  const [val, setVal] = useState(0);
  const raf = useRef();

  useEffect(() => {
    if (typeof target !== "number" || !Number.isFinite(target)) return undefined;
    if (reduced) {
      setVal(target);
      return undefined;
    }
    let start;
    const step = (t) => {
      start ??= t;
      const p = Math.min((t - start) / ms, 1);
      setVal(target * (1 - Math.pow(1 - p, 3))); // easeOutCubic
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, ms, reduced]);

  return val;
}

// Container/child variants for a coherent staggered entrance.
export const gridStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const cardRise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE_OUT_EXPO } },
};

// Chart wrapper: opacity + small y only. NEVER scale a Recharts SVG.
export function ChartReveal({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
    >
      {children}
    </motion.div>
  );
}

// Tasteful hover lift; framer owns the shadow (don't mix with hover:shadow-*).
export function HoverLift({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4, boxShadow: "0 22px 48px rgba(16,34,39,0.12)" }}
      whileTap={{ y: -1 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      {children}
    </motion.div>
  );
}

// Optional "live" pulse for a SectionTitle action slot.
export function LivePulse({ color = "#2f9e6b", label = "Live" }) {
  const reduced = useReducedMotion();
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
      <span className="relative flex h-2.5 w-2.5">
        {!reduced && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ background: color }}
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 2.6 }}
            transition={{ duration: 1.8, ease: "easeOut", repeat: Infinity, repeatDelay: 0.2 }}
          />
        )}
        <motion.span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
          animate={reduced ? {} : { scale: [1, 1.15, 1] }}
          transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
        />
      </span>
      {label}
    </span>
  );
}
