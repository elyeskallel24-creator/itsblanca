import { useState } from "react";
import { Minus, Plus, Trash2, X, Check } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

export function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove, subtotal, clear } = useCart();
  const { t } = useI18n();
  const [confirmed, setConfirmed] = useState(false);

  const handleCheckout = () => {
    setConfirmed(true);
    clear();
  };

  const handleClose = () => {
    setConfirmed(false);
    close();
  };

  return (
    <>
      {/* backdrop */}
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
          <h2 className="font-display text-2xl tracking-wide">{t.cart.title}</h2>
          <button
            onClick={handleClose}
            aria-label={t.cart.close}
            className="rounded-sm border border-border/70 p-2 hover:border-acid hover:text-acid"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {confirmed ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-acid text-acid">
              <Check className="h-6 w-6" />
            </div>
            <p className="font-mono-accent text-sm tracking-wide text-foreground/80">
              {t.cart.confirmation}
            </p>
            <button
              onClick={handleClose}
              className="font-mono-accent mt-4 rounded-sm border border-foreground/40 px-6 py-3 text-[11px] tracking-[0.25em] hover:border-acid hover:text-acid"
            >
              {t.cart.close}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <p className="font-mono-accent text-sm tracking-wide text-foreground/50">
              {t.cart.empty}
            </p>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-border/40">
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
                onClick={handleCheckout}
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
