import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Delete, LogOut, Package, Pencil, Plus, Trash2, X } from "lucide-react";
import logo from "@/assets/blanca-logo.png";
import {
  PRODUCT_CATEGORIES,
  type Product,
  deleteProduct,
  fetchProducts,
  fileToBase64,
  upsertProduct,
} from "@/lib/products";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "BLANCA — Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminRoute,
});

const CORRECT_PIN = "8280";
const AUTH_KEY = "adminAuth";

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
  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_KEY);
    onLogout();
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-card md:flex">
        <div className="flex h-20 items-center justify-center border-b border-border/60">
          <img src={logo} alt="BLANCA" className="logo-blend h-9 w-auto" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <span className="font-mono-accent flex items-center gap-3 rounded-sm bg-acid px-3 py-2.5 text-[11px] font-bold tracking-[0.2em] text-background">
            <Package className="h-4 w-4" />
            Produits
          </span>
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
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3 md:hidden">
          <img src={logo} alt="BLANCA" className="logo-blend h-7 w-auto" />
          <button
            onClick={handleLogout}
            className="font-mono-accent flex items-center gap-2 rounded-sm border border-border/60 px-3 py-1.5 text-[10px] tracking-[0.2em]"
          >
            <LogOut className="h-3 w-3" /> Déconnexion
          </button>
        </header>

        <ProductManager />
      </div>
    </div>
  );
}

function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const list = await fetchProducts();
    // hide placeholders
    setProducts(list.filter((p) => !p.id.startsWith("placeholder-")));
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
          className="font-mono-accent inline-flex items-center gap-2 rounded-sm bg-acid px-5 py-3 text-xs font-bold tracking-[0.25em] text-background hover:glow-acid"
        >
          <Plus className="h-4 w-4" />
          AJOUTER UN PRODUIT
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-border/60 bg-card">
        {loading ? (
          <div className="p-8 text-center text-sm text-foreground/60">Chargement…</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-mono-accent text-xs tracking-[0.2em] text-foreground/60">
              Aucun produit. Cliquez sur AJOUTER UN PRODUIT.
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
                  CATÉGORIE
                </th>
                <th className="font-mono-accent hidden px-4 py-3 text-[10px] tracking-[0.2em] md:table-cell">
                  BADGE
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3">
                    <div className="h-12 w-12 overflow-hidden rounded-sm bg-muted">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-muted to-card" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="font-mono-accent px-4 py-3 text-acid">{p.price} TND</td>
                  <td className="hidden px-4 py-3 text-foreground/70 md:table-cell">
                    {p.category}
                  </td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <ProductModal
          initial={editing}
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

function ProductModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Product | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "T-Shirts");
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [image, setImage] = useState<string | null>(initial?.image ?? null);
  const [saving, setSaving] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const b64 = await fileToBase64(file);
    setImage(b64);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertProduct({
        id: initial?.id ?? `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: name.trim(),
        price: Number(price) || 0,
        description: description.trim(),
        category,
        badge: badge || null,
        image,
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
        className="relative w-full max-w-2xl overflow-hidden rounded-md border border-border/60 bg-card"
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

        <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 md:grid-cols-2">
          <Field label="Nom du produit">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Prix (TND)">
            <input
              required
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
            />
          </Field>
          <Field label="Catégorie">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Badge">
            <select value={badge ?? ""} onChange={(e) => setBadge(e.target.value)} className="input">
              <option value="">Aucun</option>
              <option value="NOUVEAU">NOUVEAU</option>
              <option value="LIMITÉ">LIMITÉ</option>
              <option value="ÉPUISÉ">ÉPUISÉ</option>
            </select>
          </Field>
          <Field label="Image du produit" className="md:col-span-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="font-mono-accent block w-full text-xs text-foreground/70 file:mr-3 file:rounded-sm file:border-0 file:bg-acid file:px-3 file:py-2 file:text-xs file:font-bold file:tracking-widest file:text-background"
            />
            {image && (
              <div className="mt-3 h-40 w-full overflow-hidden rounded-sm bg-muted">
                <img src={image} alt="preview" className="h-full w-full object-cover" />
              </div>
            )}
          </Field>
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
