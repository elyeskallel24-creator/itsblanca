import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchProducts, fetchProductTypes, type Product, type ProductType } from "../lib/products";
import { useI18n, localizeBadge } from "../lib/i18n";
import { useCart } from "../lib/cart";
import { useReveal } from "../hooks/useReveal";

export function Products() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string | null>(null);
  const ref = useReveal<HTMLDivElement>();

  useEffect(() => {
    let active = true;
    Promise.all([fetchProducts(), fetchProductTypes()]).then(([p, ty]) => {
      if (!active) return;
      setProducts(p);
      setTypes(ty);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => setActiveType(null);
    window.addEventListener("blanca:shop-reset", handler);
    return () => window.removeEventListener("blanca:shop-reset", handler);
  }, []);

  // Categories: prefer admin-defined types, otherwise infer from products
  const categories = useMemo(() => {
    if (types.length > 0) return types.map((t) => t.name);
    const set = new Set<string>();
    products.forEach((p) => p.type && set.add(p.type));
    return Array.from(set);
  }, [types, products]);

  const filtered = useMemo(
    () => products.filter((p) => p.type === activeType),
    [products, activeType],
  );

  return (
    <section id="shop" className="relative bg-background py-24">
      <div ref={ref} className="fade-in-up mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div>
            <span className="font-mono-accent text-[10px] tracking-[0.3em] text-acid">
              / 02 — {t.products.title}
            </span>
            <h2 className="font-display mt-3 text-5xl tracking-tight md:text-7xl">
              {activeType ?? t.products.chooseCategory}
            </h2>
          </div>
          {activeType && (
            <button
              onClick={() => setActiveType(null)}
              className="font-mono-accent shrink-0 rounded-sm border border-border/60 px-4 py-2.5 text-[11px] tracking-[0.25em] hover:border-acid hover:text-acid"
            >
              {t.products.back}
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass h-96 animate-pulse rounded-md" aria-hidden />
            ))}
          </div>
        ) : !activeType ? (
          <CategoryGrid categories={categories} onPick={setActiveType} />
        ) : filtered.length === 0 ? (
          <p className="font-mono-accent py-16 text-center text-sm tracking-wide text-foreground/50">
            {t.products.noProducts}
          </p>
        ) : (
          <ProductGrid products={filtered} />
        )}
      </div>
    </section>
  );
}

function CategoryGrid({
  categories,
  onPick,
}: {
  categories: string[];
  onPick: (c: string) => void;
}) {
  if (categories.length === 0) {
    return (
      <p className="font-mono-accent py-16 text-center text-sm tracking-wide text-foreground/50">
        Aucune catégorie disponible.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => (
        <button
          key={c}
          onClick={() => onPick(c)}
          className="glass group relative flex h-56 items-center justify-center overflow-hidden rounded-md transition-all duration-500 hover:-translate-y-1 hover:glow-acid md:h-64"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0 0), oklch(0.08 0 0))",
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 50%, color-mix(in oklab, var(--acid) 14%, transparent), transparent 70%)",
            }}
          />
          <span className="font-display relative z-10 text-center text-4xl tracking-wide text-foreground transition-colors group-hover:text-acid md:text-6xl">
            {c}
          </span>
        </button>
      ))}
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { t } = useI18n();
  const { add } = useCart();
  const badge = localizeBadge(product.badge, t);
  const soldOut = product.badge?.toUpperCase() === "ÉPUISÉ" ||
    product.badge?.toUpperCase() === "EPUISE" ||
    product.badge?.toUpperCase() === "SOLD OUT";

  const colors = product.colors.length > 0 ? product.colors : [{ hex: "#1a1a1a", images: [] }];
  const [colorIdx, setColorIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState<string | null>(null);

  const activeColor = colors[colorIdx];
  const images = activeColor.images.length > 0 ? activeColor.images : [null];

  const next = () => setImgIdx((i) => (i + 1) % images.length);
  const prev = () => setImgIdx((i) => (i - 1 + images.length) % images.length);

  const handleColorChange = (i: number) => {
    setColorIdx(i);
    setImgIdx(0);
  };

  const handleAdd = () => {
    if (soldOut || !size) return;
    add({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      size,
      color: activeColor.hex,
    });
  };

  return (
    <article className="glass group relative flex flex-col overflow-hidden rounded-md transition-all duration-500 hover:-translate-y-1 hover:glow-acid">
      <div className="relative h-72 w-full overflow-hidden bg-muted">
        {images[imgIdx] ? (
          <img
            src={images[imgIdx]!}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="grain flex h-full w-full items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.18 0 0), oklch(0.10 0 0))",
            }}
          >
            <span className="font-display px-4 text-center text-3xl tracking-wide text-foreground/30">
              {product.name}
            </span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-border/60 bg-background/60 p-1.5 backdrop-blur-md hover:border-acid hover:text-acid"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-border/60 bg-background/60 p-1.5 backdrop-blur-md hover:border-acid hover:text-acid"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === imgIdx ? "bg-acid" : "bg-foreground/30"}`}
                />
              ))}
            </div>
          </>
        )}

        {badge && (
          <span
            className={`font-mono-accent absolute left-3 top-3 rounded-sm px-2 py-1 text-[10px] tracking-[0.25em] ${
              soldOut
                ? "bg-destructive text-destructive-foreground"
                : badge === t.badges.sale
                  ? "bg-[oklch(0.7_0.2_30)] text-background"
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
          <div className="shrink-0 text-right">
            {product.hasDiscount && product.oldPrice ? (
              <>
                <div className="font-mono-accent text-[11px] text-foreground/50 line-through">
                  {product.oldPrice} TND
                </div>
                <div className="font-mono-accent text-sm text-acid">{product.price} TND</div>
              </>
            ) : (
              <span className="font-mono-accent text-sm text-acid">{product.price} TND</span>
            )}
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-foreground/60">{product.description}</p>

        {/* Color selector */}
        {colors.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {colors.map((c, i) => (
              <button
                key={i}
                onClick={() => handleColorChange(i)}
                aria-label={`Color ${c.hex}`}
                className={`h-6 w-6 rounded-full border-2 transition-all ${
                  i === colorIdx ? "border-acid scale-110" : "border-border/60"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}

        {/* Size selector */}
        {product.availableSizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.availableSizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`font-mono-accent rounded-sm border px-3 py-1.5 text-[11px] tracking-widest transition-all ${
                  size === s
                    ? "border-acid bg-acid text-background"
                    : "border-border/60 text-foreground/80 hover:border-acid hover:text-acid"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <button
          disabled={soldOut || !size}
          onClick={handleAdd}
          className="font-mono-accent mt-auto rounded-sm border border-foreground/30 px-4 py-3 text-[11px] tracking-[0.25em] text-foreground transition-all hover:border-acid hover:bg-acid hover:text-background disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground"
          title={!size && !soldOut ? t.products.selectSize : undefined}
        >
          {!size && !soldOut ? t.products.selectSize : t.products.addToCart}
        </button>
      </div>
    </article>
  );
}
