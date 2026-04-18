import { useI18n } from "@/lib/i18n";
import { useReveal } from "@/hooks/useReveal";

export function About() {
  const { t } = useI18n();
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="about" className="relative overflow-hidden border-t border-border/40 bg-background py-24">
      {/* decorative lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div ref={ref} className="fade-in-up relative mx-auto max-w-5xl px-4 text-center md:px-8">
        <span className="font-mono-accent text-[10px] tracking-[0.3em] text-acid">
          / 03 — {t.about.title}
        </span>
        <p className="font-display mt-6 text-3xl leading-[1.05] tracking-tight md:text-6xl">
          {t.about.body}
        </p>

        <div className="mx-auto mt-10 h-px w-24 bg-acid" />
      </div>
    </section>
  );
}
