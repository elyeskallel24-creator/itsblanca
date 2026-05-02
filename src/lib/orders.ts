import { supabase } from "../integrations/supabase/client";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  image: string | null;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total_price: number;
  status: string;
  created_at?: string;
}

export const ORDER_STATUSES = [
  "En attente",
  "Confirmée",
  "Expédiée",
  "Livrée",
  "Annulée",
] as const;

export async function createOrder(order: Omit<Order, "created_at">): Promise<void> {
  const { error } = await supabase.from("orders").insert({
    id: order.id,
    customer_name: order.customer_name,
    phone: order.phone,
    address: order.address,
    items: order.items as unknown as never,
    total_price: order.total_price,
    status: order.status,
  });
  if (error) throw error;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchOrders", error);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.id as string,
    customer_name: row.customer_name as string,
    phone: row.phone as string,
    address: row.address as string,
    items: Array.isArray(row.items) ? (row.items as unknown as OrderItem[]) : [],
    total_price: Number(row.total_price) || 0,
    status: row.status as string,
    created_at: row.created_at as string,
  }));
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}
