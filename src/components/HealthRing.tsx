import { cn } from "@/lib/utils";

export function HealthRing({ value, size = 96, label }: { value: number; size?: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const color = clamped >= 75 ? "text-leaf-600" : clamped >= 50 ? "text-chili-500" : "text-destructive";
  return (
    <div className="relative grid place-items-center shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 96 96" className="size-full -rotate-90">
        <circle cx="48" cy="48" r={r} className="stroke-earth-200" strokeWidth={7} fill="none" />
        <circle
          cx="48" cy="48" r={r}
          strokeWidth={7} fill="none"
          strokeLinecap="round"
          className={cn(color, "transition-[stroke-dashoffset] duration-1000")}
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: "drop-shadow(0 2px 8px color-mix(in oklab, currentColor 30%, transparent))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className={cn("text-2xl font-bold leading-none", color)}>{clamped}</div>
          {label && <div className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">{label}</div>}
        </div>
      </div>
    </div>
  );
}
