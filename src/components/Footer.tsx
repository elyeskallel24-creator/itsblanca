import logo from "../assets/blanca-logo.png";
import { useI18n } from "../lib/i18n";

export function Footer() {
  const { t } = useI18n();
  const links = [
    { label: t.nav.home, href: "#home" },
    { label: t.nav.shop, href: "#shop" },
    { label: t.nav.about, href: "#about" },
  ];
  return (
    <footer className="border-t border-border/60 bg-background py-14">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 text-center md:px-8">
        <img src={logo} alt="BLANCA" className="logo-blend h-12 w-auto" />
        <p className="font-mono-accent max-w-md text-xs tracking-[0.2em] text-foreground/60">
          {t.footer.tagline}
        </p>
        <nav className="flex flex-wrap justify-center gap-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-mono-accent text-[11px] tracking-[0.25em] text-foreground/70 transition-colors hover:text-acid"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="font-mono-accent text-[10px] tracking-[0.25em] text-foreground/40">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
