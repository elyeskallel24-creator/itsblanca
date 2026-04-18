import { useI18n } from "@/lib/i18n";
import { useReveal } from "@/hooks/useReveal";

export function Hero() {
  const { t } = useI18n();
  const ref = useReveal<HTMLDivElement>();

  return (
    <section
      id="home"
      className="grain relative flex min-h-screen items-center overflow-hidden bg-background pt-24"
    >
      {/* radial atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 20%, color-mix(in oklab, var(--acid) 12%, transparent), transparent 70%), radial-gradient(40% 40% at 10% 90%, color-mix(in oklab, var(--ice) 10%, transparent), transparent 70%)",
        }}
      />

      <div ref={ref} className="fade-in-up relative z-10 mx-auto w-full max-w-7xl px-4 md:px-8">
        <span className="font-mono-accent inline-block rounded-sm border border-acid/40 px-3 py-1 text-[10px] tracking-[0.3em] text-acid">
          BLANCA · DROP 01 / 2026
        </span>

        <h1 className="font-display mt-6 text-[clamp(3.5rem,12vw,11rem)] leading-[0.85] tracking-tight">
          {t.hero.h1}
        </h1>
        <h2 className="font-display text-glow-acid mt-2 text-[clamp(3rem,11vw,10rem)] leading-[0.85] tracking-tight text-acid">
          {t.hero.h2}
        </h2>

        <p className="mt-8 max-w-xl text-base text-foreground/70 md:text-lg">{t.hero.sub}</p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#shop"
            className="font-mono-accent group relative inline-flex items-center justify-center overflow-hidden rounded-sm bg-acid px-7 py-4 text-xs font-bold tracking-[0.25em] text-background transition-all hover:glow-acid"
          >
            {t.hero.cta1}
          </a>
          <a
            href="#shop"
            className="font-mono-accent inline-flex items-center justify-center rounded-sm border border-foreground/40 px-7 py-4 text-xs font-bold tracking-[0.25em] text-foreground transition-all hover:border-acid hover:text-acid"
          >
            {t.hero.cta2}
          </a>
        </div>
      </div>

      {/* big bg word */}
      <div
        aria-hidden
        className="font-display pointer-events-none absolute inset-x-0 bottom-[-2vw] z-0 select-none text-center text-[26vw] leading-none text-foreground/[0.04]"
      >
        BLANCA
      </div>
    </section>
  );
}
