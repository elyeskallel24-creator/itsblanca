import { useEffect, useState } from "react";
import { fetchProducts, type Product } from "../lib/products";
import { useI18n, localizeBadge } from "../lib/i18n";
import { useCart } from "../lib/cart";
import { useReveal } from "../hooks/useReveal";

function ProductPlaceholderImage({ name }: { name: string }) {
  return (
    <div
      className="grain relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.18 0 0), oklch(0.10 0 0)), radial-gradient(60% 50% at 30% 30%, color-mix(in oklab, var(--acid) 10%, transparent), transparent 70%)",
      }}
    >
      <span className="font-display relative z-10 px-4 text-center text-3xl tracking-wide text-foreground/30 md:text-5xl">
        {name}
      </span>
    </div>
  );
}

function ProductCard({
  product,
  className,
  imageHeightClass,
}: {
  product: Product;
  className?: string;
  imageHeightClass: string;
}) {
  const { t } = useI18n();
  const { add } = useCart();
  const badge = localizeBadge(product.badge, t);
  const soldOut = product.badge?.toUpperCase() === "ÉPUISÉ" ||
    product.badge?.toUpperCase() === "EPUISE" ||
    product.badge?.toUpperCase() === "SOLD OUT";

  return (
    <article
      className={`glass group relative flex flex-col overflow-hidden rounded-md transition-all duration-500 hover:-translate-y-1 hover:glow-acid ${className ?? ""}`}
    >
      <div className={`relative w-full overflow-hidden ${imageHeightClass}`}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <ProductPlaceholderImage name={product.name} />
        )}
        {badge && (
          <span
            className={`font-mono-accent absolute left-3 top-3 rounded-sm px-2 py-1 text-[10px] tracking-[0.25em] ${
              soldOut
                ? "bg-destructive text-destructive-foreground"
                : "bg-acid text-background"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight tracking-wide">{product.name}</h3>
          <span className="font-mono-accent shrink-0 text-sm text-acid">{product.price} TND</span>
        </div>
        <p className="line-clamp-2 text-sm text-foreground/60">{product.description}</p>
        <button
          disabled={soldOut}
          onClick={() =>
            add({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
            })
          }
          className="font-mono-accent mt-auto rounded-sm border border-foreground/30 px-4 py-3 text-[11px] tracking-[0.25em] text-foreground transition-all hover:border-acid hover:bg-acid hover:text-background disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground"
        >
          {t.products.addToCart}
        </button>
      </div>
    </article>
  );
}

export function Products() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useReveal<HTMLDivElement>();

  useEffect(() => {
    let active = true;
    fetchProducts().then((p) => {
      if (active) {
        setProducts(p);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="shop" className="relative bg-background py-24">
      <div ref={ref} className="fade-in-up mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="font-mono-accent text-[10px] tracking-[0.3em] text-acid">
              / 02 — {t.products.title}
            </span>
            <h2 className="font-display mt-3 text-5xl tracking-tight md:text-7xl">
              {t.products.title}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="glass h-96 animate-pulse rounded-md"
                aria-hidden
              />
            ))}
          </div>
        ) : (
          <BentoGrid products={products} />
        )}
      </div>
    </section>
  );
}

function BentoGrid({ products }: { products: Product[] }) {
  // Bento pattern: first card spans 2 cols + 2 rows on md+, others normal.
  return (
    <div className="grid auto-rows-[minmax(280px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p, idx) => {
        const isHero = idx % 5 === 0;
        return (
          <ProductCard
            key={p.id}
            product={p}
            className={isHero ? "lg:col-span-2 lg:row-span-2" : ""}
            imageHeightClass={isHero ? "h-72 md:h-[28rem]" : "h-64"}
          />
        );
      })}
    </div>
  );
}
