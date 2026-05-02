import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Delete,
  LogOut,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
  Layers,
  Ruler,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import logo from "../assets/blanca-logo.png";
import {
  BADGE_OPTIONS,
  type Product,
  type ProductColor,
  type ProductType,
  type SizeDeck,
  deleteProduct,
  deleteProductType,
  deleteSizeDeck,
  fetchProducts,
  fetchProductTypes,
  fetchSizeDecks,
  newId,
  upsertProduct,
  upsertProductType,
  upsertSizeDeck,
  uploadProductImage,
} from "../lib/products";
import {
  ORDER_STATUSES,
  fetchOrders,
  updateOrderStatus,
  type Order,
} from "../lib/orders";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "BLANCA — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminRoute,
});

const CORRECT_PIN = "8280";
const AUTH_KEY = "adminAuth";

type Section = "products" | "types" | "decks" | "orders";

function AdminRoute() {
  const [authed, setAuthed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAuthed(window.localStorage.getItem(AUTH_KEY) === "true");
    }
    setHydrated(true);
  }, []);

  if (!hydrated) return <div className="min-h-screen bg-background" />;
  if (!authed) return <PinScreen onSuccess={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => setAuthed(false)} />;
}

/* ---------------- PIN SCREEN ---------------- */

function PinScreen({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (pin.length !== 4) return;
    if (pin === CORRECT_PIN) {
      window.localStorage.setItem(AUTH_KEY, "true");
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => {
        setPin("");
        setShake(false);
      }, 500);
    }
  }, [pin, onSuccess]);

  const press = (digit: string) => {
    setError(false);
    setPin((p) => (p.length < 4 ? p + digit : p));
  };
  const back = () => {
    setError(false);
    setPin((p) => p.slice(0, -1));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div
        className={`w-full max-w-sm rounded-md border border-border/60 bg-card p-8 ${
          shake ? "animate-[shake_0.45s_cubic-bezier(0.36,0.07,0.19,0.97)_both]" : ""
        }`}
      >
        <div className="mb-6 flex justify-center">
          <img src={logo} alt="BLANCA" className="logo-blend h-12 w-auto" />
        </div>
        <h1 className="font-display text-glow-acid text-center text-3xl tracking-wide text-acid">
          ACCÈS ADMIN
        </h1>

        <div className="mt-8 flex justify-center gap-4">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full border ${
                pin.length > i ? "border-acid bg-acid" : "border-foreground/30"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="font-mono-accent mt-4 text-center text-xs tracking-[0.2em] text-destructive">
            Accès refusé
          </p>
        )}

        <div className="mt-8 grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <KeyButton key={d} onClick={() => press(d)}>
              {d}
            </KeyButton>
          ))}
          <span />
          <KeyButton onClick={() => press("0")}>0</KeyButton>
          <KeyButton onClick={back} aria-label="Retour">
            <Delete className="mx-auto h-5 w-5" />
          </KeyButton>
        </div>
      </div>
    </div>
  );
}

function KeyButton({
  children,
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      onClick={onClick}
      className="font-display rounded-sm border border-border/60 bg-background py-4 text-2xl text-foreground transition-all hover:border-acid hover:text-acid active:scale-95"
    >
      {children}
    </button>
  );
}

/* ---------------- DASHBOARD ---------------- */

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<Section>("products");

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_KEY);
    onLogout();
  };

  const items: Array<{ id: Section; label: string; icon: typeof Package }> = [
    { id: "products", label: "Produits", icon: Package },
    { id: "types", label: "Types de Produits", icon: Layers },
    { id: "decks", label: "Grilles de Tailles", icon: Ruler },
    { id: "orders", label: "Commandes", icon: ShoppingCart },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-card md:flex">
        <div className="flex h-20 items-center justify-center border-b border-border/60">
          <img src={logo} alt="BLANCA" className="logo-blend h-9 w-auto" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {items.map((it) => {
            const Icon = it.icon;
            const active = section === it.id;
            return (
              <button
                key={it.id}
                onClick={() => setSection(it.id)}
                className={`font-mono-accent flex items-center gap-3 rounded-sm px-3 py-2.5 text-[11px] tracking-[0.2em] transition-all ${
                  active
                    ? "bg-acid font-bold text-background"
                    : "text-foreground/80 hover:bg-background hover:text-acid"
                }`}
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </button>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="font-mono-accent m-3 flex items-center gap-3 rounded-sm border border-border/60 px-3 py-2.5 text-[11px] tracking-[0.2em] text-foreground/80 hover:border-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* mobile top bar */}
        <header className="flex flex-col gap-2 border-b border-border/60 px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <img src={logo} alt="BLANCA" className="logo-blend h-7 w-auto" />
            <button
              onClick={handleLogout}
              className="font-mono-accent flex items-center gap-2 rounded-sm border border-border/60 px-3 py-1.5 text-[10px] tracking-[0.2em]"
            >
              <LogOut className="h-3 w-3" /> Sortie
            </button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => setSection(it.id)}
                className={`font-mono-accent shrink-0 rounded-sm px-3 py-1.5 text-[10px] tracking-[0.15em] ${
                  section === it.id
                    ? "bg-acid font-bold text-background"
                    : "border border-border/60 text-foreground/70"
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>
        </header>

        {section === "products" && <ProductManager />}
        {section === "types" && <TypeManager />}
        {section === "decks" && <DeckManager />}
        {section === "orders" && <OrderManager />}
      </div>
    </div>
  );
}

/* ---------------- PRODUCT MANAGER ---------------- */

function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [decks, setDecks] = useState<SizeDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const [list, ty, dk] = await Promise.all([
      fetchProducts(),
      fetchProductTypes(),
      fetchSizeDecks(),
    ]);
    setProducts(list.filter((p) => !p.id.startsWith("placeholder-")));
    setTypes(ty);
    setDecks(dk);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setOpen(true);
  };
  const startEdit = (p: Product) => {
    setEditing(p);
    setOpen(true);
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Supprimer "${p.name}" ?`)) return;
    await deleteProduct(p.id);
    await refresh();
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono-accent text-[10px] tracking-[0.3em] text-acid">/ ADMIN</span>
          <h1 className="font-display mt-2 text-4xl tracking-tight md:text-5xl">
            GESTION DES PRODUITS
          </h1>
        </div>
        <button
          onClick={startCreate}
          disabled={types.length === 0}
          title={types.length === 0 ? "Créez d'abord un type de produit" : undefined}
          className="font-mono-accent inline-flex items-center gap-2 rounded-sm bg-acid px-5 py-3 text-xs font-bold tracking-[0.25em] text-background hover:glow-acid disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          AJOUTER UN PRODUIT
        </button>
      </div>

      {types.length === 0 && (
        <div className="mb-6 rounded-sm border border-acid bg-acid/10 p-4">
          <p className="font-mono-accent text-xs tracking-wide text-acid">
            ⚠ Créez d'abord un Type de Produit (et une Grille de Tailles) avant d'ajouter des produits.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-border/60 bg-card">
        {loading ? (
          <div className="p-8 text-center text-sm text-foreground/60">Chargement…</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-mono-accent text-xs tracking-[0.2em] text-foreground/60">
              Aucun produit.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-foreground/60">
                <th className="font-mono-accent px-4 py-3 text-[10px] tracking-[0.2em]">IMAGE</th>
                <th className="font-mono-accent px-4 py-3 text-[10px] tracking-[0.2em]">NOM</th>
                <th className="font-mono-accent px-4 py-3 text-[10px] tracking-[0.2em]">PRIX</th>
                <th className="font-mono-accent hidden px-4 py-3 text-[10px] tracking-[0.2em] md:table-cell">
                  TYPE
                </th>
                <th className="font-mono-accent hidden px-4 py-3 text-[10px] tracking-[0.2em] md:table-cell">
                  BADGE
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const firstImg = p.colors[0]?.images[0] ?? null;
                return (
                  <tr key={p.id} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded-sm bg-muted">
                        {firstImg ? (
                          <img src={firstImg} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-muted to-card" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="font-mono-accent px-4 py-3 text-acid">
                      {p.hasDiscount && p.oldPrice ? (
                        <span>
                          <span className="text-foreground/40 line-through">{p.oldPrice}</span>{" "}
                          {p.price} TND
                        </span>
                      ) : (
                        <>{p.price} TND</>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-foreground/70 md:table-cell">{p.type}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {p.badge ? (
                        <span className="font-mono-accent rounded-sm bg-acid/20 px-2 py-1 text-[10px] tracking-[0.2em] text-acid">
                          {p.badge}
                        </span>
                      ) : (
                        <span className="text-foreground/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="font-mono-accent inline-flex items-center gap-1 rounded-sm border border-border/60 px-3 py-1.5 text-[10px] tracking-[0.2em] hover:border-acid hover:text-acid"
                        >
                          <Pencil className="h-3 w-3" /> MODIFIER
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="font-mono-accent inline-flex items-center gap-1 rounded-sm border border-border/60 px-3 py-1.5 text-[10px] tracking-[0.2em] hover:border-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" /> SUPPRIMER
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <ProductModal
          initial={editing}
          types={types}
          decks={decks}
          onClose={() => setOpen(false)}
          onSaved={async () => {
            setOpen(false);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

/* ---------------- PRODUCT MODAL ---------------- */

function ProductModal({
  initial,
  types,
  decks,
  onClose,
  onSaved,
}: {
  initial: Product | null;
  types: ProductType[];
  decks: SizeDeck[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [typeName, setTypeName] = useState(initial?.type ?? types[0]?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [hasDiscount, setHasDiscount] = useState(initial?.hasDiscount ?? false);
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [oldPrice, setOldPrice] = useState(initial?.oldPrice ?? 0);
  const [availableSizes, setAvailableSizes] = useState<string[]>(initial?.availableSizes ?? []);
  const [colors, setColors] = useState<ProductColor[]>(
    initial?.colors && initial.colors.length > 0
      ? initial.colors
      : [{ hex: "#000000", images: [] }],
  );
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [saving, setSaving] = useState(false);

  // Resolve current type's deck
  const currentType = types.find((t) => t.name === typeName);
  const currentDeck = decks.find((d) => d.id === currentType?.size_deck_id);
  const deckSizes = currentDeck?.sizes ?? [];

  const toggleSize = (s: string) => {
    setAvailableSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const updateColorHex = (idx: number, hex: string) =>
    setColors((cs) => cs.map((c, i) => (i === idx ? { ...c, hex } : c)));

  const removeColor = (idx: number) =>
    setColors((cs) => (cs.length === 1 ? cs : cs.filter((_, i) => i !== idx)));

  const addColor = () =>
    setColors((cs) => [...cs, { hex: "#ffffff", images: [] }]);

  const handleColorImageUpload = async (idx: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const remaining = 6 - colors[idx].images.length;
      const filesArr = Array.from(files).slice(0, remaining);
      const urls = await Promise.all(filesArr.map((f) => uploadProductImage(f)));
      setColors((cs) =>
        cs.map((c, i) => (i === idx ? { ...c, images: [...c.images, ...urls] } : c)),
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors du téléversement de l'image.");
    }
  };

  const removeColorImage = (colorIdx: number, imgIdx: number) =>
    setColors((cs) =>
      cs.map((c, i) =>
        i === colorIdx ? { ...c, images: c.images.filter((_, j) => j !== imgIdx) } : c,
      ),
    );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (colors.length === 0) {
      alert("Au moins une couleur est requise.");
      return;
    }
    setSaving(true);
    try {
      await upsertProduct({
        id: initial?.id ?? newId("p"),
        name: name.trim(),
        type: typeName,
        description: description.trim(),
        price: Number(price) || 0,
        oldPrice: hasDiscount ? Number(oldPrice) || 0 : null,
        hasDiscount,
        availableSizes,
        colors,
        badge: badge || null,
      });
      await onSaved();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-border/60 bg-card"
      >
        <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h3 className="font-display text-2xl tracking-wide">
            {initial ? "MODIFIER" : "AJOUTER UN PRODUIT"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-border/60 p-1.5 hover:border-acid hover:text-acid"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nom du produit">
              <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </Field>
            <Field label="Type de produit">
              <select
                value={typeName}
                onChange={(e) => {
                  setTypeName(e.target.value);
                  setAvailableSizes([]);
                }}
                className="input"
                required
              >
                {types.length === 0 && <option value="">— Aucun type —</option>}
                {types.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description courte" className="md:col-span-2">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input resize-none"
              />
            </Field>
          </div>

          {/* Pricing */}
          <Section title="PRIX">
            <label className="mb-3 flex items-center gap-3">
              <input
                type="checkbox"
                checked={hasDiscount}
                onChange={(e) => setHasDiscount(e.target.checked)}
                className="h-4 w-4 accent-acid"
              />
              <span className="font-mono-accent text-[11px] tracking-[0.2em] text-foreground/80">
                Appliquer une réduction
              </span>
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              {hasDiscount && (
                <Field label="Ancien prix (TND)">
                  <input
                    type="number"
                    min={0}
                    value={oldPrice}
                    onChange={(e) => setOldPrice(Number(e.target.value))}
                    className="input"
                  />
                </Field>
              )}
              <Field label={hasDiscount ? "Prix réduit (TND)" : "Prix (TND)"}>
                <input
                  required
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="input"
                />
              </Field>
            </div>
          </Section>

          {/* Sizes */}
          <Section title="TAILLES DISPONIBLES">
            {!currentDeck ? (
              <p className="font-mono-accent text-[11px] tracking-wide text-foreground/50">
                Aucune grille de tailles assignée à ce type.
              </p>
            ) : deckSizes.length === 0 ? (
              <p className="font-mono-accent text-[11px] tracking-wide text-foreground/50">
                La grille "{currentDeck.name}" est vide.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {deckSizes.map((s) => {
                  const checked = availableSizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`font-mono-accent rounded-sm border px-3 py-1.5 text-[11px] tracking-widest transition-all ${
                        checked
                          ? "border-acid bg-acid text-background"
                          : "border-border/60 hover:border-acid hover:text-acid"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Colors */}
          <Section title="COULEURS & PHOTOS">
            <div className="space-y-4">
              {colors.map((c, idx) => (
                <div key={idx} className="rounded-sm border border-border/60 bg-background/50 p-3">
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className="h-8 w-8 shrink-0 rounded-full border border-border/60"
                      style={{ backgroundColor: c.hex }}
                    />
                    <input
                      value={c.hex}
                      onChange={(e) => updateColorHex(idx, e.target.value)}
                      placeholder="#000000"
                      className="input flex-1"
                    />
                    {colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColor(idx)}
                        className="rounded-sm border border-border/60 p-2 text-foreground/60 hover:border-destructive hover:text-destructive"
                        aria-label="Supprimer couleur"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {c.images.map((url, j) => (
                      <div key={j} className="relative aspect-square overflow-hidden rounded-sm bg-muted">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeColorImage(idx, j)}
                          className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-foreground/80 hover:text-destructive"
                          aria-label="Retirer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {c.images.length < 6 && (
                      <label className="flex aspect-square cursor-pointer items-center justify-center rounded-sm border border-dashed border-border/60 text-foreground/40 hover:border-acid hover:text-acid">
                        <ImageIcon className="h-5 w-5" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleColorImageUpload(idx, e.target.files)}
                        />
                      </label>
                    )}
                  </div>
                  <p className="font-mono-accent mt-2 text-[10px] tracking-wide text-foreground/40">
                    {c.images.length}/6 photos
                  </p>
                </div>
              ))}
              <button
                type="button"
                onClick={addColor}
                className="font-mono-accent flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-border/60 py-3 text-[11px] tracking-[0.25em] text-foreground/70 hover:border-acid hover:text-acid"
              >
                <Plus className="h-4 w-4" /> AJOUTER UNE COULEUR
              </button>
            </div>
          </Section>

          {/* Badge */}
          <Section title="BADGE">
            <select value={badge ?? ""} onChange={(e) => setBadge(e.target.value)} className="input">
              {BADGE_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b === "" ? "Aucun" : b}
                </option>
              ))}
            </select>
          </Section>
        </div>

        <footer className="flex justify-end gap-3 border-t border-border/60 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="font-mono-accent rounded-sm border border-border/60 px-5 py-2.5 text-[11px] tracking-[0.25em] hover:border-foreground"
          >
            ANNULER
          </button>
          <button
            type="submit"
            disabled={saving}
            className="font-mono-accent rounded-sm bg-acid px-5 py-2.5 text-[11px] font-bold tracking-[0.25em] text-background hover:glow-acid disabled:opacity-60"
          >
            {saving ? "…" : "ENREGISTRER"}
          </button>
        </footer>

        <style>{`
          .input {
            width: 100%;
            background: var(--background);
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 10px 12px;
            color: var(--foreground);
            font-size: 14px;
            outline: none;
            transition: border-color 0.15s;
          }
          .input:focus { border-color: var(--acid); }
        `}</style>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-border/40 pt-5">
      <h4 className="font-mono-accent mb-3 text-[10px] tracking-[0.3em] text-acid">{title}</h4>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="font-mono-accent text-[10px] tracking-[0.25em] text-foreground/60">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ---------------- TYPE MANAGER ---------------- */

function TypeManager() {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [decks, setDecks] = useState<SizeDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductType | null>(null);

  const refresh = async () => {
    setLoading(true);
    const [t, d] = await Promise.all([fetchProductTypes(), fetchSizeDecks()]);
    setTypes(t);
    setDecks(d);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const startNew = () => setEditing({ id: "", name: "", size_deck_id: decks[0]?.id ?? null });

  const handleDelete = async (t: ProductType) => {
    if (!confirm(`Supprimer le type "${t.name}" ?`)) return;
    await deleteProductType(t.id);
    await refresh();
  };

  const handleSave = async (t: ProductType) => {
    await upsertProductType({ ...t, id: t.id || newId("t") });
    setEditing(null);
    await refresh();
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono-accent text-[10px] tracking-[0.3em] text-acid">/ ADMIN</span>
          <h1 className="font-display mt-2 text-4xl tracking-tight md:text-5xl">
            TYPES DE PRODUITS
          </h1>
        </div>
        <button
          onClick={startNew}
          className="font-mono-accent inline-flex items-center gap-2 rounded-sm bg-acid px-5 py-3 text-xs font-bold tracking-[0.25em] text-background hover:glow-acid"
        >
          <Plus className="h-4 w-4" /> AJOUTER UN TYPE
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-border/60 bg-card">
        {loading ? (
          <div className="p-8 text-center text-sm text-foreground/60">Chargement…</div>
        ) : types.length === 0 ? (
          <div className="p-12 text-center font-mono-accent text-xs tracking-[0.2em] text-foreground/60">
            Aucun type.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-foreground/60">
                <th className="font-mono-accent px-4 py-3 text-[10px] tracking-[0.2em]">NOM</th>
                <th className="font-mono-accent px-4 py-3 text-[10px] tracking-[0.2em]">GRILLE DE TAILLES</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {types.map((t) => {
                const d = decks.find((x) => x.id === t.size_deck_id);
                return (
                  <tr key={t.id} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3 text-foreground/70">{d?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditing(t)}
                          className="font-mono-accent inline-flex items-center gap-1 rounded-sm border border-border/60 px-3 py-1.5 text-[10px] tracking-[0.2em] hover:border-acid hover:text-acid"
                        >
                          <Pencil className="h-3 w-3" /> MODIFIER
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="font-mono-accent inline-flex items-center gap-1 rounded-sm border border-border/60 px-3 py-1.5 text-[10px] tracking-[0.2em] hover:border-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" /> SUPPRIMER
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <SimpleModal title={editing.id ? "MODIFIER LE TYPE" : "AJOUTER UN TYPE"} onClose={() => setEditing(null)}>
          <TypeForm
            initial={editing}
            decks={decks}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </SimpleModal>
      )}
    </div>
  );
}

function TypeForm({
  initial,
  decks,
  onSave,
  onCancel,
}: {
  initial: ProductType;
  decks: SizeDeck[];
  onSave: (t: ProductType) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [deckId, setDeckId] = useState(initial.size_deck_id ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ ...initial, name: name.trim(), size_deck_id: deckId || null });
        setSaving(false);
      }}
      className="space-y-4 p-5"
    >
      <Field label="Nom du type">
        <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Grille de tailles">
        <select className="input" value={deckId} onChange={(e) => setDeckId(e.target.value)}>
          <option value="">— Aucune —</option>
          {decks.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="font-mono-accent rounded-sm border border-border/60 px-5 py-2.5 text-[11px] tracking-[0.25em]"
        >
          ANNULER
        </button>
        <button
          type="submit"
          disabled={saving}
          className="font-mono-accent rounded-sm bg-acid px-5 py-2.5 text-[11px] font-bold tracking-[0.25em] text-background"
        >
          {saving ? "…" : "ENREGISTRER"}
        </button>
      </div>
      <style>{`
        .input { width: 100%; background: var(--background); border: 1px solid var(--border); border-radius: 4px; padding: 10px 12px; color: var(--foreground); font-size: 14px; outline: none; }
        .input:focus { border-color: var(--acid); }
      `}</style>
    </form>
  );
}

/* ---------------- DECK MANAGER ---------------- */

function DeckManager() {
  const [decks, setDecks] = useState<SizeDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SizeDeck | null>(null);

  const refresh = async () => {
    setLoading(true);
    setDecks(await fetchSizeDecks());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (d: SizeDeck) => {
    if (!confirm(`Supprimer la grille "${d.name}" ?`)) return;
    await deleteSizeDeck(d.id);
    await refresh();
  };

  const handleSave = async (d: SizeDeck) => {
    await upsertSizeDeck({ ...d, id: d.id || newId("d") });
    setEditing(null);
    await refresh();
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono-accent text-[10px] tracking-[0.3em] text-acid">/ ADMIN</span>
          <h1 className="font-display mt-2 text-4xl tracking-tight md:text-5xl">
            GRILLES DE TAILLES
          </h1>
        </div>
        <button
          onClick={() => setEditing({ id: "", name: "", sizes: [] })}
          className="font-mono-accent inline-flex items-center gap-2 rounded-sm bg-acid px-5 py-3 text-xs font-bold tracking-[0.25em] text-background hover:glow-acid"
        >
          <Plus className="h-4 w-4" /> AJOUTER UNE GRILLE
        </button>
      </div>

      {loading ? (
        <div className="rounded-md border border-border/60 bg-card p-8 text-center text-sm text-foreground/60">
          Chargement…
        </div>
      ) : decks.length === 0 ? (
        <div className="rounded-md border border-border/60 bg-card p-12 text-center font-mono-accent text-xs tracking-[0.2em] text-foreground/60">
          Aucune grille.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {decks.map((d) => (
            <div key={d.id} className="rounded-md border border-border/60 bg-card p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl tracking-wide">{d.name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(d)}
                    className="rounded-sm border border-border/60 p-2 hover:border-acid hover:text-acid"
                    aria-label="Modifier"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(d)}
                    className="rounded-sm border border-border/60 p-2 hover:border-destructive hover:text-destructive"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {d.sizes.map((s) => (
                  <span
                    key={s}
                    className="font-mono-accent rounded-sm border border-border/60 px-2.5 py-1 text-[11px] tracking-widest text-foreground/80"
                  >
                    {s}
                  </span>
                ))}
                {d.sizes.length === 0 && (
                  <span className="font-mono-accent text-[10px] text-foreground/40">Vide</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <SimpleModal
          title={editing.id ? "MODIFIER LA GRILLE" : "AJOUTER UNE GRILLE"}
          onClose={() => setEditing(null)}
        >
          <DeckForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
        </SimpleModal>
      )}
    </div>
  );
}

function DeckForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: SizeDeck;
  onSave: (d: SizeDeck) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [sizes, setSizes] = useState<string[]>(initial.sizes);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const addSize = () => {
    const v = draft.trim();
    if (!v || sizes.includes(v)) return;
    setSizes((s) => [...s, v]);
    setDraft("");
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ ...initial, name: name.trim(), sizes });
        setSaving(false);
      }}
      className="space-y-4 p-5"
    >
      <Field label="Nom de la grille">
        <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Tailles">
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSize();
              }
            }}
            placeholder="Ex: M, 32, XL…"
            className="input flex-1"
          />
          <button
            type="button"
            onClick={addSize}
            className="font-mono-accent rounded-sm border border-border/60 px-4 text-[11px] tracking-[0.2em] hover:border-acid hover:text-acid"
          >
            +
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSizes((arr) => arr.filter((x) => x !== s))}
              className="font-mono-accent inline-flex items-center gap-1.5 rounded-sm border border-border/60 px-2.5 py-1 text-[11px] tracking-widest text-foreground/80 hover:border-destructive hover:text-destructive"
            >
              {s}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="font-mono-accent rounded-sm border border-border/60 px-5 py-2.5 text-[11px] tracking-[0.25em]"
        >
          ANNULER
        </button>
        <button
          type="submit"
          disabled={saving}
          className="font-mono-accent rounded-sm bg-acid px-5 py-2.5 text-[11px] font-bold tracking-[0.25em] text-background"
        >
          {saving ? "…" : "ENREGISTRER"}
        </button>
      </div>
      <style>{`
        .input { width: 100%; background: var(--background); border: 1px solid var(--border); border-radius: 4px; padding: 10px 12px; color: var(--foreground); font-size: 14px; outline: none; }
        .input:focus { border-color: var(--acid); }
      `}</style>
    </form>
  );
}

/* ---------------- ORDER MANAGER ---------------- */

function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setOrders(await fetchOrders());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const totalRevenue = useMemo(
    () => orders.filter((o) => o.status !== "Annulée").reduce((s, o) => s + o.total_price, 0),
    [orders],
  );

  const handleStatus = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 md:px-10">
      <div className="mb-8">
        <span className="font-mono-accent text-[10px] tracking-[0.3em] text-acid">/ ADMIN</span>
        <h1 className="font-display mt-2 text-4xl tracking-tight md:text-5xl">COMMANDES</h1>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="TOTAL COMMANDES" value={orders.length.toString()} />
        <Stat label="REVENU TOTAL" value={`${totalRevenue} TND`} />
        <Stat
          label="EN ATTENTE"
          value={orders.filter((o) => o.status === "En attente").length.toString()}
        />
      </div>

      <div className="overflow-hidden rounded-md border border-border/60 bg-card">
        {loading ? (
          <div className="p-8 text-center text-sm text-foreground/60">Chargement…</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center font-mono-accent text-xs tracking-[0.2em] text-foreground/60">
            Aucune commande.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-foreground/60">
                <th className="font-mono-accent px-3 py-3 text-[10px] tracking-[0.2em]">CLIENT</th>
                <th className="font-mono-accent hidden px-3 py-3 text-[10px] tracking-[0.2em] md:table-cell">
                  TÉL.
                </th>
                <th className="font-mono-accent px-3 py-3 text-[10px] tracking-[0.2em]">TOTAL</th>
                <th className="font-mono-accent px-3 py-3 text-[10px] tracking-[0.2em]">STATUT</th>
                <th className="font-mono-accent hidden px-3 py-3 text-[10px] tracking-[0.2em] md:table-cell">
                  DATE
                </th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <>
                  <tr key={o.id} className="border-b border-border/40 last:border-0">
                    <td className="px-3 py-3 font-medium">{o.customer_name}</td>
                    <td className="hidden px-3 py-3 text-foreground/70 md:table-cell">{o.phone}</td>
                    <td className="font-mono-accent px-3 py-3 text-acid">{o.total_price} TND</td>
                    <td className="px-3 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatus(o.id, e.target.value)}
                        className="font-mono-accent rounded-sm border border-border/60 bg-background px-2 py-1 text-[10px] tracking-widest"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="font-mono-accent hidden px-3 py-3 text-[10px] text-foreground/60 md:table-cell">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        className="rounded-sm border border-border/60 p-1.5 hover:border-acid hover:text-acid"
                        aria-label="Détails"
                      >
                        {expanded === o.id ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr key={`${o.id}-details`} className="bg-background/50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="font-mono-accent mb-1 text-[10px] tracking-[0.2em] text-acid">
                              ADRESSE
                            </p>
                            <p className="text-sm text-foreground/80">{o.address}</p>
                            <p className="font-mono-accent mt-2 text-[10px] tracking-[0.2em] text-acid">
                              TÉLÉPHONE
                            </p>
                            <p className="text-sm text-foreground/80">{o.phone}</p>
                          </div>
                          <div>
                            <p className="font-mono-accent mb-2 text-[10px] tracking-[0.2em] text-acid">
                              ARTICLES
                            </p>
                            <ul className="space-y-1.5">
                              {o.items.map((it, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                  {it.color && (
                                    <span
                                      className="h-3 w-3 rounded-full border border-border/60"
                                      style={{ backgroundColor: it.color }}
                                    />
                                  )}
                                  <span className="font-medium">{it.name}</span>
                                  {it.size && (
                                    <span className="font-mono-accent text-[10px] tracking-widest text-foreground/50">
                                      {it.size}
                                    </span>
                                  )}
                                  <span className="text-foreground/60">×{it.quantity}</span>
                                  <span className="font-mono-accent ml-auto text-acid">
                                    {it.price * it.quantity} TND
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-card p-4">
      <p className="font-mono-accent text-[10px] tracking-[0.25em] text-foreground/60">{label}</p>
      <p className="font-display mt-2 text-3xl tracking-wide text-acid">{value}</p>
    </div>
  );
}

/* ---------------- SIMPLE MODAL ---------------- */

function SimpleModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-md border border-border/60 bg-card">
        <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h3 className="font-display text-2xl tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-sm border border-border/60 p-1.5 hover:border-acid hover:text-acid"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
