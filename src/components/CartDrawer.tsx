import { useState, type FormEvent } from "react";
import { Minus, Plus, Trash2, X, Check, Truck } from "lucide-react";
import { useCart } from "../lib/cart";
import { useI18n } from "../lib/i18n";
import { createOrder } from "../lib/orders";
import { newId } from "../lib/products";

type Stage = "cart" | "form" | "confirmed";

export function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove, subtotal, clear } = useCart();
  const { t } = useI18n();
  const [stage, setStage] = useState<Stage>("cart");

  const handleClose = () => {
    close();
    // reset stage after drawer animates out
    setTimeout(() => setStage("cart"), 300);
  };

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-border/60 bg-background shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="font-display text-2xl tracking-wide">
            {stage === "form" ? t.checkout.title : t.cart.title}
          </h2>
          <button
            onClick={handleClose}
            aria-label={t.cart.close}
            className="rounded-sm border border-border/70 p-2 hover:border-acid hover:text-acid"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {stage === "confirmed" ? (
          <ConfirmationView onClose={handleClose} />
        ) : stage === "form" ? (
          <CheckoutForm
            onBack={() => setStage("cart")}
            onSuccess={() => {
              clear();
              setStage("confirmed");
            }}
          />
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <p className="font-mono-accent text-sm tracking-wide text-foreground/50">
              {t.cart.empty}
            </p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border/40 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-muted">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-card text-[9px] text-foreground/40">
                        {item.name.slice(0, 6)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-display text-lg leading-tight">{item.name}</span>
                      <button
                        onClick={() => remove(item.id)}
                        aria-label={t.cart.remove}
                        className="text-foreground/50 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="font-mono-accent flex items-center gap-2 text-[10px] tracking-widest text-foreground/50">
                      {item.size && <span>{t.cart.size}: {item.size}</span>}
                      {item.color && (
                        <span className="flex items-center gap-1">
                          {t.cart.color}:
                          <span
                            className="inline-block h-3 w-3 rounded-full border border-border/60"
                            style={{ backgroundColor: item.color }}
                          />
                        </span>
                      )}
                    </div>
                    <span className="font-mono-accent text-xs text-acid">{item.price} TND</span>
                    <div className="mt-auto flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        className="rounded-sm border border-border/70 p-1.5 hover:border-acid hover:text-acid"
                        aria-label="-"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono-accent w-6 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        className="rounded-sm border border-border/70 p-1.5 hover:border-acid hover:text-acid"
                        aria-label="+"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-border/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono-accent text-xs tracking-[0.25em] text-foreground/70">
                  {t.cart.subtotal}
                </span>
                <span className="font-display text-2xl text-acid">{subtotal} TND</span>
              </div>
              <button
                onClick={() => setStage("form")}
                className="font-mono-accent w-full rounded-sm bg-acid py-4 text-xs font-bold tracking-[0.25em] text-background transition-all hover:glow-acid"
              >
                {t.cart.checkout}
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

function CheckoutForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const { t } = useI18n();
  const { items, subtotal } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createOrder({
        id: newId("o"),
        customer_name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: items.map((i) => ({
          id: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          image: i.image,
        })),
        total_price: subtotal,
        status: "En attente",
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Une erreur s'est produite. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex-1 space-y-4 p-5">
        <div>
          <label className="font-mono-accent mb-1.5 block text-[10px] tracking-[0.25em] text-foreground/60">
            {t.checkout.name}
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            className="w-full rounded-sm border border-border/70 bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-acid"
          />
        </div>
        <div>
          <label className="font-mono-accent mb-1.5 block text-[10px] tracking-[0.25em] text-foreground/60">
            {t.checkout.phone}
          </label>
          <input
            required
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={30}
            className="w-full rounded-sm border border-border/70 bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-acid"
          />
        </div>
        <div>
          <label className="font-mono-accent mb-1.5 block text-[10px] tracking-[0.25em] text-foreground/60">
            {t.checkout.address}
          </label>
          <textarea
            required
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={500}
            className="w-full resize-none rounded-sm border border-border/70 bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-acid"
          />
        </div>

        <div className="flex items-center gap-3 rounded-sm border border-acid bg-acid/10 px-4 py-3">
          <Truck className="h-5 w-5 text-acid" />
          <span className="font-mono-accent text-xs font-bold tracking-[0.2em] text-acid">
            {t.checkout.cod}
          </span>
        </div>

        {error && (
          <p className="font-mono-accent text-center text-xs tracking-wide text-destructive">
            {error}
          </p>
        )}
      </div>

      <footer className="border-t border-border/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono-accent text-xs tracking-[0.25em] text-foreground/70">
            {t.cart.subtotal}
          </span>
          <span className="font-display text-2xl text-acid">{subtotal} TND</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="font-mono-accent rounded-sm border border-border/70 px-4 py-3 text-[11px] tracking-[0.25em] hover:border-foreground"
          >
            ←
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="font-mono-accent flex-1 rounded-sm bg-acid py-3 text-xs font-bold tracking-[0.25em] text-background transition-all hover:glow-acid disabled:opacity-60"
          >
            {submitting ? "…" : t.checkout.confirm}
          </button>
        </div>
      </footer>
    </form>
  );
}

function ConfirmationView({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-acid text-acid">
        <Check className="h-6 w-6" />
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
        {t.checkout.thanks}
      </p>
      <button
        onClick={onClose}
        className="font-mono-accent mt-4 rounded-sm border border-foreground/40 px-6 py-3 text-[11px] tracking-[0.25em] hover:border-acid hover:text-acid"
      >
        {t.cart.close}
      </button>
    </div>
  );
}
