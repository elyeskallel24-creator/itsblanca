import { useI18n } from "../lib/i18n";

export function Marquee() {
  const { t } = useI18n();
  const text = t.marquee;
  return (
    <div className="relative overflow-hidden border-y border-acid/60 bg-acid py-3">
      <div className="flex w-max animate-[marquee_24s_linear_infinite] whitespace-nowrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="font-mono-accent px-6 text-sm font-bold tracking-[0.25em] text-background"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
