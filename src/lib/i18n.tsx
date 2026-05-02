import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "en";

type Dict = {
  nav: { home: string; shop: string; about: string; cart: string };
  hero: { h1: string; h2: string; sub: string; cta1: string; cta2: string };
  marquee: string;
  products: {
    title: string;
    addToCart: string;
    selectSize: string;
    chooseCategory: string;
    back: string;
    noProducts: string;
  };
  badges: { new: string; limited: string; soldout: string; sale: string };
  about: { title: string; body: string };
  cart: {
    title: string;
    subtotal: string;
    checkout: string;
    empty: string;
    confirmation: string;
    close: string;
    remove: string;
    size: string;
    color: string;
  };
  checkout: {
    title: string;
    name: string;
    phone: string;
    address: string;
    cod: string;
    confirm: string;
    thanks: string;
  };
  footer: { copyright: string; tagline: string };
};

const dictionaries: Record<Lang, Dict> = {
  fr: {
    nav: { home: "ACCUEIL", shop: "BOUTIQUE", about: "À PROPOS", cart: "Panier" },
    hero: {
      h1: "FAIT POUR LES RUES.",
      h2: "CRÉÉ POUR TOI.",
      sub: "Nouveaux drops. Style authentique. Zéro compromis.",
      cta1: "ACHETER MAINTENANT",
      cta2: "DÉCOUVRIR",
    },
    marquee:
      "NOUVEAU DROP // STOCK LIMITÉ // LIVRAISON GRATUITE DÈS 100 TND // NOUVELLES TENUES //",
    products: {
      title: "BOUTIQUE",
      addToCart: "AJOUTER AU PANIER",
      selectSize: "Choisir une taille",
      chooseCategory: "CHOISIR UNE CATÉGORIE",
      back: "← Retour",
      noProducts: "Aucun produit dans cette catégorie.",
    },
    badges: { new: "NOUVEAU", limited: "LIMITÉ", soldout: "ÉPUISÉ", sale: "SOLDE" },
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
      size: "Taille",
      color: "Couleur",
    },
    checkout: {
      title: "FINALISER LA COMMANDE",
      name: "Prénom et Nom",
      phone: "Numéro de téléphone",
      address: "Adresse de livraison",
      cod: "Paiement à la livraison",
      confirm: "CONFIRMER LA COMMANDE",
      thanks:
        "Nous vous remercions sincèrement pour votre commande.\n\nVotre panier est actuellement en cours de validation.\n\nDans les prochaines heures, l'un de nos conseillers prendra contact avec vous par appel téléphonique ou WhatsApp afin de confirmer votre commande, vérifier vos informations de livraison et vous accompagner jusqu'à la réception.",
    },
    footer: {
      copyright: "© 2026 BLANCA. Tous droits réservés.",
      tagline: "Streetwear authentique. Drops limités.",
    },
  },
  en: {
    nav: { home: "HOME", shop: "SHOP", about: "ABOUT", cart: "Cart" },
    hero: {
      h1: "BUILT FOR THE STREETS.",
      h2: "MADE FOR YOU.",
      sub: "New drops. Real style. Zero compromise.",
      cta1: "SHOP NOW",
      cta2: "DISCOVER",
    },
    marquee: "NEW DROP // LIMITED STOCK // FREE SHIPPING OVER 100 TND // FRESH FITS //",
    products: {
      title: "SHOP",
      addToCart: "ADD TO CART",
      selectSize: "Select a size",
      chooseCategory: "CHOOSE A CATEGORY",
      back: "← Back",
      noProducts: "No products in this category.",
    },
    badges: { new: "NEW", limited: "LIMITED", soldout: "SOLD OUT", sale: "SALE" },
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
      size: "Size",
      color: "Color",
    },
    checkout: {
      title: "COMPLETE YOUR ORDER",
      name: "First and Last Name",
      phone: "Phone Number",
      address: "Delivery Address",
      cod: "Cash on Delivery",
      confirm: "CONFIRM ORDER",
      thanks:
        "We sincerely thank you for your order.\n\nYour cart is currently being processed for validation.\n\nIn the next few hours, one of our advisors will contact you by phone call or WhatsApp to confirm your order, verify your delivery information, and assist you until you receive your package.",
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
  if (["SOLDE", "SALE"].includes(key)) return t.badges.sale;
  return badge;
}
