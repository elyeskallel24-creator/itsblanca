import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "en";

type Dict = {
  nav: { home: string; shop: string; drops: string; about: string; cart: string };
  hero: { h1: string; h2: string; sub: string; cta1: string; cta2: string };
  marquee: string;
  products: { title: string; addToCart: string };
  badges: { new: string; limited: string; soldout: string };
  about: { title: string; body: string };
  cart: {
    title: string;
    subtotal: string;
    checkout: string;
    empty: string;
    confirmation: string;
    close: string;
    remove: string;
  };
  footer: { copyright: string; tagline: string };
};

const dictionaries: Record<Lang, Dict> = {
  fr: {
    nav: { home: "ACCUEIL", shop: "BOUTIQUE", drops: "DROPS", about: "À PROPOS", cart: "Panier" },
    hero: {
      h1: "FAIT POUR LES RUES.",
      h2: "CRÉÉ POUR TOI.",
      sub: "Nouveaux drops. Style authentique. Zéro compromis.",
      cta1: "ACHETER MAINTENANT",
      cta2: "VOIR LES DROPS",
    },
    marquee:
      "NOUVEAU DROP // STOCK LIMITÉ // LIVRAISON GRATUITE DÈS 100 TND // NOUVELLES TENUES //",
    products: { title: "DERNIERS DROPS", addToCart: "AJOUTER AU PANIER" },
    badges: { new: "NOUVEAU", limited: "LIMITÉ", soldout: "ÉPUISÉ" },
    about: {
      title: "MANIFESTE",
      body: "On ne suit pas les tendances. On les crée. Fait par des jeunes, pour des jeunes. Chaque pièce est un message.",
    },
    cart: {
      title: "MON PANIER",
      subtotal: "SOUS-TOTAL",
      checkout: "COMMANDER",
      empty: "Votre panier est vide.",
      confirmation: "Commande reçue ! Nous vous contacterons bientôt.",
      close: "Fermer",
      remove: "Retirer",
    },
    footer: {
      copyright: "© 2026 BLANCA. Tous droits réservés.",
      tagline: "Streetwear authentique. Drops limités.",
    },
  },
  en: {
    nav: { home: "HOME", shop: "SHOP", drops: "DROPS", about: "ABOUT", cart: "Cart" },
    hero: {
      h1: "BUILT FOR THE STREETS.",
      h2: "MADE FOR YOU.",
      sub: "New drops. Real style. Zero compromise.",
      cta1: "SHOP NOW",
      cta2: "VIEW DROPS",
    },
    marquee: "NEW DROP // LIMITED STOCK // FREE SHIPPING OVER 100 TND // FRESH FITS //",
    products: { title: "LATEST DROPS", addToCart: "ADD TO CART" },
    badges: { new: "NEW", limited: "LIMITED", soldout: "SOLD OUT" },
    about: {
      title: "MANIFESTO",
      body: "We don't follow trends. We set them. Built by teens, for teens. Every piece is a statement.",
    },
    cart: {
      title: "MY CART",
      subtotal: "SUBTOTAL",
      checkout: "CHECKOUT",
      empty: "Your cart is empty.",
      confirmation: "Order received! We will contact you soon.",
      close: "Close",
      remove: "Remove",
    },
    footer: {
      copyright: "© 2026 BLANCA. All rights reserved.",
      tagline: "Authentic streetwear. Limited drops.",
    },
  },
};

interface I18nContextValue {
  lang: Lang;
  t: Dict;
  toggle: () => void;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("lang");
    if (saved === "fr" || saved === "en") setLangState(saved);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") window.localStorage.setItem("lang", next);
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === "fr" ? "en" : "fr");
  }, [lang, setLang]);

  return (
    <I18nContext.Provider value={{ lang, t: dictionaries[lang], toggle, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** Map a stored badge value (any language) to the localized label. */
export function localizeBadge(badge: string | null | undefined, t: Dict): string | null {
  if (!badge) return null;
  const key = badge.toUpperCase();
  if (["NOUVEAU", "NEW"].includes(key)) return t.badges.new;
  if (["LIMITÉ", "LIMITE", "LIMITED"].includes(key)) return t.badges.limited;
  if (["ÉPUISÉ", "EPUISE", "SOLD OUT", "SOLDOUT"].includes(key)) return t.badges.soldout;
  return badge;
}
