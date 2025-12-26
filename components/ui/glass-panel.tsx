import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type GlassVariant = "card" | "sidebar" | "header" | "modal";

const variantClasses: Record<GlassVariant, string> = {
  card: "rounded-3xl border border-white/60 bg-white/70 shadow-[0_18px_60px_rgba(15,23,42,0.08)]",
  sidebar: "rounded-3xl border border-white/60 bg-white/70 shadow-[0_24px_90px_rgba(15,23,42,0.12)]",
  header: "rounded-3xl border border-white/60 bg-white/70 shadow-[0_20px_70px_rgba(15,23,42,0.08)]",
  modal: "rounded-3xl border border-white/70 bg-white/80 shadow-[0_28px_110px_rgba(15,23,42,0.16)]",
};

type GlassPanelProps = {
  variant?: GlassVariant;
  className?: string;
  children: ReactNode;
};

export function GlassPanel({
  variant = "card",
  className,
  children,
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "backdrop-blur-2xl",
        variantClasses[variant],
        "border-white/65",
        className,
      )}
    >
      {children}
    </div>
  );
}
