import { supabase } from "../integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  badge: string | null;
  image: string | null;
}

export const PRODUCT_CATEGORIES = [
  "T-Shirts",
  "Hoodies",
  "Pantalons",
  "Accessoires",
  "Autre",
] as const;

export const BADGE_OPTIONS_FR = ["", "NOUVEAU", "LIMITÉ", "ÉPUISÉ"] as const;

export const PLACEHOLDER_PRODUCTS: Product[] = [
  {
    id: "placeholder-1",
    name: "SHADOW HOODIE",
    price: 89,
    description: "Oversized fit. Premium fleece. Built for the cold season.",
    category: "Hoodies",
    badge: "NOUVEAU",
    image: null,
  },
  {
    id: "placeholder-2",
    name: "ACID TEE VOL.1",
    price: 45,
    description: "Graphic tee with acid-washed print. Limited run.",
    category: "T-Shirts",
    badge: "LIMITÉ",
    image: null,
  },
  {
    id: "placeholder-3",
    name: "URBAN CARGO PANTS",
    price: 120,
    description: "Multi-pocket cargos with adjustable fit. Street-ready.",
    category: "Pantalons",
    badge: null,
    image: null,
  },
];

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, description, category, badge, image")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch products", error);
    return PLACEHOLDER_PRODUCTS;
  }
  if (!data || data.length === 0) return PLACEHOLDER_PRODUCTS;
  return data as Product[];
}

export async function upsertProduct(product: Product): Promise<void> {
  const { error } = await supabase.from("products").upsert({
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description,
    category: product.category,
    badge: product.badge,
    image: product.image,
  });
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
