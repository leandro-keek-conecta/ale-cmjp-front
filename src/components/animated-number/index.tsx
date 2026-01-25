import { useEffect, useMemo, useState } from "react";

type AnimatedNumberProps = {
  value: string | number;
  durationMs?: number;
  locale?: string;
  formatOptions?: Intl.NumberFormatOptions;
};

export default function AnimatedNumber({
  value,
  durationMs = 1500,
  locale = "pt-BR",
  formatOptions,
}: AnimatedNumberProps) {
  const target = useMemo(() => {
    if (typeof value === "number") return value;
    const numeric = value.toString().replace(/[^\d-]/g, "");
    return numeric ? Number.parseInt(numeric, 10) : 0;
  }, [value]);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reduceMotion.matches) {
        setDisplayValue(target);
        return;
      }
    }

    if (durationMs <= 0) {
      setDisplayValue(target);
      return;
    }

    let start: number | null = null;
    let animationFrame = 0;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / durationMs, 1);
      const nextValue = Math.round(progress * target);
      setDisplayValue(nextValue);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    setDisplayValue(0);
    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, durationMs]);

  const formatted = useMemo(
    () => new Intl.NumberFormat(locale, formatOptions).format(displayValue),
    [displayValue, locale, formatOptions],
  );

  return <span>{formatted}</span>;
}
