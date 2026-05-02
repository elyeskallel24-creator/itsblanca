import { supabase } from "../integrations/supabase/client";

export interface ProductColor {
  hex: string;
  images: string[]; // Public storage URLs (up to 6)
}

export interface Product {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  oldPrice: number | null;
  hasDiscount: boolean;
  availableSizes: string[];
  colors: ProductColor[];
  badge: string | null;
  created_at?: string;
}

export interface ProductType {
  id: string;
  name: string;
  size_deck_id: string | null;
}

export interface SizeDeck {
  id: string;
  name: string;
  sizes: string[];
}

export const BADGE_OPTIONS = ["", "NOUVEAU", "LIMITÉ", "ÉPUISÉ", "SOLDE"] as const;

export const PLACEHOLDER_PRODUCTS: Product[] = [
  {
    id: "placeholder-1",
    name: "SHADOW HOODIE",
    type: "Hoodies",
    description: "Oversized fit. Premium fleece. Built for the cold season.",
    price: 89,
    oldPrice: null,
    hasDiscount: false,
    availableSizes: ["S", "M", "L", "XL"],
    colors: [{ hex: "#1A1A1A", images: [] }],
    badge: "NOUVEAU",
  },
  {
    id: "placeholder-2",
    name: "ACID TEE VOL.1",
    type: "T-Shirts",
    description: "Graphic tee with acid-washed print. Limited run.",
    price: 45,
    oldPrice: null,
    hasDiscount: false,
    availableSizes: ["S", "M", "L"],
    colors: [{ hex: "#AAFF00", images: [] }],
    badge: "LIMITÉ",
  },
  {
    id: "placeholder-3",
    name: "URBAN CARGO PANTS",
    type: "Pantalons",
    description: "Multi-pocket cargos with adjustable fit. Street-ready.",
    price: 120,
    oldPrice: null,
    hasDiscount: false,
    availableSizes: ["30", "32", "34"],
    colors: [{ hex: "#3a3a3a", images: [] }],
    badge: null,
  },
];

interface DbProductRow {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number | string;
  old_price: number | string | null;
  has_discount: boolean;
  available_sizes: string[] | null;
  colors: unknown;
  badge: string | null;
  created_at?: string;
}

function rowToProduct(row: DbProductRow): Product {
  let colors: ProductColor[] = [];
  if (Array.isArray(row.colors)) {
    colors = (row.colors as ProductColor[]).filter(
      (c) => c && typeof c.hex === "string" && Array.isArray(c.images),
    );
  }
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description,
    price: Number(row.price) || 0,
    oldPrice: row.old_price === null ? null : Number(row.old_price),
    hasDiscount: !!row.has_discount,
    availableSizes: Array.isArray(row.available_sizes) ? row.available_sizes : [],
    colors,
    badge: row.badge,
    created_at: row.created_at,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, type, description, price, old_price, has_discount, available_sizes, colors, badge, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch products", error);
    return PLACEHOLDER_PRODUCTS;
  }
  if (!data || data.length === 0) return PLACEHOLDER_PRODUCTS;
  return (data as unknown as DbProductRow[]).map(rowToProduct);
}

export async function upsertProduct(product: Product): Promise<void> {
  const { error } = await supabase.from("products").upsert({
    id: product.id,
    name: product.name,
    type: product.type,
    description: product.description,
    price: product.price,
    old_price: product.hasDiscount ? product.oldPrice : null,
    has_discount: product.hasDiscount,
    available_sizes: product.availableSizes,
    colors: product.colors as unknown as never,
    badge: product.badge,
  });
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------- PRODUCT TYPES ---------------- */

export async function fetchProductTypes(): Promise<ProductType[]> {
  const { data, error } = await supabase
    .from("product_types")
    .select("id, name, size_deck_id")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchProductTypes", error);
    return [];
  }
  return (data ?? []) as ProductType[];
}

export async function upsertProductType(t: ProductType): Promise<void> {
  const { error } = await supabase.from("product_types").upsert({
    id: t.id,
    name: t.name,
    size_deck_id: t.size_deck_id,
  });
  if (error) throw error;
}

export async function deleteProductType(id: string): Promise<void> {
  const { error } = await supabase.from("product_types").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------- SIZE DECKS ---------------- */

export async function fetchSizeDecks(): Promise<SizeDeck[]> {
  const { data, error } = await supabase
    .from("size_decks")
    .select("id, name, sizes")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchSizeDecks", error);
    return [];
  }
  return (data ?? []).map((d) => ({
    id: d.id as string,
    name: d.name as string,
    sizes: Array.isArray(d.sizes) ? (d.sizes as string[]) : [],
  }));
}

export async function upsertSizeDeck(d: SizeDeck): Promise<void> {
  const { error } = await supabase.from("size_decks").upsert({
    id: d.id,
    name: d.name,
    sizes: d.sizes,
  });
  if (error) throw error;
}

export async function deleteSizeDeck(id: string): Promise<void> {
  const { error } = await supabase.from("size_decks").delete().eq("id", id);
  if (error) throw error;
}

/* ---------------- IMAGE UPLOAD ---------------- */

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
