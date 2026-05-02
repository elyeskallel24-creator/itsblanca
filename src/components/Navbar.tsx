import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import logo from "../assets/blanca-logo.png";
import { useI18n } from "../lib/i18n";
import { useCart } from "../lib/cart";

export function Navbar() {
  const { t, lang, toggle } = useI18n();
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToShop = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    // Reset shop view to category landing
    window.dispatchEvent(new CustomEvent("blanca:shop-reset"));
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  const links = [
    { label: t.nav.home, href: "#home", onClick: undefined as ((e: React.MouseEvent) => void) | undefined },
    { label: t.nav.shop, href: "#shop", onClick: goToShop },
    { label: t.nav.about, href: "#about", onClick: undefined },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/70 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="BLANCA"
            className="logo-blend h-9 w-auto md:h-10"
            draggable={false}
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={l.onClick}
              className="font-mono-accent text-xs tracking-[0.2em] text-foreground/80 transition-colors hover:text-acid"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle language"
            className="font-mono-accent rounded-sm border border-border/70 px-2.5 py-1 text-[11px] tracking-widest text-foreground/80 transition-all hover:border-acid hover:text-acid"
          >
            {lang === "fr" ? "EN" : "FR"}
          </button>

          <button
            onClick={open}
            aria-label={t.nav.cart}
            className="relative rounded-sm border border-border/70 p-2 transition-all hover:border-acid hover:text-acid"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="font-mono-accent absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-acid px-1 text-[10px] font-bold text-background">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-sm border border-border/70 p-2 md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col px-4 py-4">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={(e) => {
                  if (l.onClick) l.onClick(e);
                  setMobileOpen(false);
                }}
                className="font-mono-accent border-b border-border/40 py-3 text-sm tracking-[0.25em] text-foreground/80 last:border-0 hover:text-acid"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
