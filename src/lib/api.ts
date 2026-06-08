import { supabase } from "@/integrations/supabase/client";
import type { Customer, Product, Package, CustomPricing, Invoice, InvoiceItem } from "./types";

// ---------- Customers ----------
export async function listCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from("customers").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as Customer[];
}
export async function upsertCustomer(c: Partial<Customer> & { id?: string }) {
  const payload = {
    name: c.name ?? "",
    shop_name: c.shop_name ?? "",
    phone: c.phone ?? "",
    gst: c.gst ?? "",
    address: c.address ?? "",
  };
  if (c.id) {
    const { error } = await supabase.from("customers").update(payload).eq("id", c.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("customers").insert(payload);
    if (error) throw error;
  }
}
export async function deleteCustomer(id: string) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Products + Packages ----------
export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").order("product_name");
  if (error) throw error;
  return (data ?? []) as Product[];
}
export async function upsertProduct(p: Partial<Product> & { id?: string }) {
  if (p.id) {
    const { error } = await supabase.from("products").update({ product_name: p.product_name ?? "" }).eq("id", p.id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from("products").insert({ product_name: p.product_name }).select().single();
    if (error) throw error;
    return data as Product;
  }
}
export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function listPackages(): Promise<Package[]> {
  const { data, error } = await supabase.from("packages").select("*").order("package");
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ ...r, price: Number(r.price), stock: Number(r.stock) })) as Package[];
}
export async function upsertPackage(p: Partial<Package> & { id?: string; product_id: string }) {
  const payload = {
    product_id: p.product_id,
    package: p.package ?? "",
    price: Number(p.price ?? 0),
    stock: Number(p.stock ?? 0),
  };
  if (p.id) {
    const { error } = await supabase.from("packages").update(payload).eq("id", p.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("packages").insert(payload);
    if (error) throw error;
  }
}
export async function deletePackage(id: string) {
  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) throw error;
}
export async function adjustPackageStock(id: string, delta: number) {
  const { data, error } = await supabase.from("packages").select("stock").eq("id", id).single();
  if (error) throw error;
  const next = Math.max(0, Number(data.stock) + delta);
  const { error: e2 } = await supabase.from("packages").update({ stock: next }).eq("id", id);
  if (e2) throw e2;
}
export async function setPackageStock(id: string, stock: number) {
  const { error } = await supabase.from("packages").update({ stock: Math.max(0, stock) }).eq("id", id);
  if (error) throw error;
}

// ---------- Custom pricing ----------
export async function listCustomPricing(): Promise<CustomPricing[]> {
  const { data, error } = await supabase.from("custom_pricing").select("*");
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ ...r, custom_price: Number(r.custom_price) })) as CustomPricing[];
}
export async function setCustomPrice(customer_id: string, package_id: string, custom_price: number) {
  const { error } = await supabase
    .from("custom_pricing")
    .upsert({ customer_id, package_id, custom_price }, { onConflict: "customer_id,package_id" });
  if (error) throw error;
}
export async function removeCustomPrice(customer_id: string, package_id: string) {
  const { error } = await supabase
    .from("custom_pricing")
    .delete()
    .eq("customer_id", customer_id)
    .eq("package_id", package_id);
  if (error) throw error;
}

// ---------- Invoices ----------
export async function listInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase.from("invoices").select("*").order("date", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToInvoice);
}
export async function getInvoice(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToInvoice(data) : null;
}
function rowToInvoice(r: any): Invoice {
  return {
    id: r.id,
    invoice_no: r.invoice_no,
    customer_id: r.customer_id,
    customer_snapshot: r.customer_snapshot,
    date: r.date,
    delivery_note: r.delivery_note ?? "",
    payment_terms: r.payment_terms ?? "",
    reference_no: r.reference_no ?? "",
    buyer_order_no: r.buyer_order_no ?? "",
    delivery_date: r.delivery_date,
    items: (r.items ?? []) as InvoiceItem[],
    subtotal: Number(r.subtotal),
    gst_enabled: r.gst_enabled,
    gst_rate: Number(r.gst_rate),
    gst_amount: Number(r.gst_amount),
    total: Number(r.total),
  };
}
export async function nextInvoiceNumber(): Promise<string> {
  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_no")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  let max = 0;
  for (const row of data ?? []) {
    const m = /INV-?(\d+)/i.exec(row.invoice_no || "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return "INV-" + String(max + 1).padStart(4, "0");
}
export async function createInvoice(inv: Omit<Invoice, "id">) {
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      invoice_no: inv.invoice_no,
      customer_id: inv.customer_id,
      customer_snapshot: inv.customer_snapshot,
      date: inv.date,
      delivery_note: inv.delivery_note ?? "",
      payment_terms: inv.payment_terms ?? "",
      reference_no: inv.reference_no ?? "",
      buyer_order_no: inv.buyer_order_no ?? "",
      delivery_date: inv.delivery_date || null,
      items: inv.items,
      subtotal: inv.subtotal,
      gst_enabled: inv.gst_enabled,
      gst_rate: inv.gst_rate,
      gst_amount: inv.gst_amount,
      total: inv.total,
    })
    .select()
    .single();
  if (error) throw error;
  // reduce stock for packaged items
  for (const it of inv.items) {
    if (it.package_id) await adjustPackageStock(it.package_id, -it.qty);
  }
  return rowToInvoice(data);
}
export async function deleteInvoice(id: string) {
  const inv = await getInvoice(id);
  if (!inv) return;
  for (const it of inv.items) {
    if (it.package_id) await adjustPackageStock(it.package_id, +it.qty);
  }
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
}
