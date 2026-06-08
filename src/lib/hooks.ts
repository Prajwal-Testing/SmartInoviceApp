import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import * as api from "./api";
import type { Customer, Package, Product } from "./types";

export const qk = {
  customers: ["customers"] as const,
  products: ["products"] as const,
  packages: ["packages"] as const,
  pricing: ["custom_pricing"] as const,
  invoices: ["invoices"] as const,
  invoice: (id: string) => ["invoice", id] as const,
};

export function useCustomers() {
  return useQuery({ queryKey: qk.customers, queryFn: api.listCustomers, initialData: [] as Customer[] });
}
export function useProducts() {
  return useQuery({ queryKey: qk.products, queryFn: api.listProducts, initialData: [] as Product[] });
}
export function usePackages() {
  return useQuery({ queryKey: qk.packages, queryFn: api.listPackages, initialData: [] as Package[] });
}
export function useCustomPricing() {
  return useQuery({ queryKey: qk.pricing, queryFn: api.listCustomPricing, initialData: [] });
}
export function useInvoices() {
  return useQuery({ queryKey: qk.invoices, queryFn: api.listInvoices, initialData: [] });
}
export function useInvoice(id: string) {
  return useQuery({ queryKey: qk.invoice(id), queryFn: () => api.getInvoice(id) });
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (...keys: readonly (readonly unknown[])[]) =>
    keys.forEach(k => qc.invalidateQueries({ queryKey: k as unknown as unknown[] }));
}

export function useMut<TArgs, TRes>(fn: (a: TArgs) => Promise<TRes>, invalidate: readonly unknown[][] = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => invalidate.forEach(k => qc.invalidateQueries({ queryKey: k as any })),
  });
}

/** Effective price for a customer + package */
export function effectivePrice(
  customerId: string | null,
  pkg: Package | undefined,
  pricing: { customer_id: string; package_id: string; custom_price: number }[],
): number {
  if (!pkg) return 0;
  if (customerId) {
    const cp = pricing.find(p => p.customer_id === customerId && p.package_id === pkg.id);
    if (cp) return cp.custom_price;
  }
  return pkg.price;
}
