// components/ui-lite/card.tsx
export default function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "rounded-2xl bg-white shadow-[0_10px_30px_-22px_rgba(0,0,0,0.35)] ring-1 ring-neutral-200",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
