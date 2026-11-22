import type { ReactNode } from "react";
import type { SVGProps } from "react";

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon,
  tone = "green",
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  icon: ReactNode;
  tone?: "green" | "lime" | "amber" | "blue";
}) {
  const tones = {
    green: "bg-brand-50 text-brand-700",
    lime: "bg-lime-soft/40 text-lime-deep",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-sky-50 text-sky-600",
  } as const;

  return (
    <div className="card rise relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-semibold tracking-wide text-muted">{label}</p>
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="num mt-3 text-[23px] leading-none font-extrabold tracking-tight text-ink">
        {value}
        {unit && (
          <span className="ml-1 text-[12.5px] font-semibold text-muted">{unit}</span>
        )}
      </p>
      {hint && <p className="mt-2 text-[11.5px] text-muted">{hint}</p>}
    </div>
  );
}

export function Meter({
  value,
  max,
  tone = "brand",
}: {
  value: number;
  max: number;
  tone?: "brand" | "lime" | "amber";
}) {
  const pct = max > 0 ? Math.max(3, Math.min(100, (value / max) * 100)) : 0;
  const colors = {
    brand: "bg-brand-600",
    lime: "bg-lime-deep",
    amber: "bg-amber-500",
  } as const;

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/80">
      <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const palette = [
    "bg-brand-100 text-brand-800",
    "bg-amber-100 text-amber-800",
    "bg-sky-100 text-sky-800",
    "bg-rose-100 text-rose-800",
    "bg-violet-100 text-violet-800",
  ];
  const color = palette[name.length % palette.length];

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold ${color} ${
        size === "sm" ? "size-8 text-[10.5px]" : "size-9 text-[12px]"
      }`}
      aria-hidden="true"
    >
      {letters}
    </span>
  );
}

export type IconType = (p: SVGProps<SVGSVGElement>) => ReactNode;
