import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  useCustomers, useProducts, usePackages, useCustomPricing,
  useInvalidate, qk, effectivePrice,
} from "@/lib/hooks";
import { createInvoice, nextInvoiceNumber } from "@/lib/api";
import type { Customer, Invoice, InvoiceItem, Package } from "@/lib/types";
import { PREDEFINED_PACKAGES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { formatINR, todayISO } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/invoices/new")({
  head: () => ({ meta: [{ title: "New Invoice — SmartInvoice" }] }),
  component: NewInvoice,
});

type DraftItem = {
  key: string;
  product_id: string;
  package_id: string | null;
  product_name: string;
  package: string;
  qty: number;
  rate: number;
  amount: number;
  isCustomPkg: boolean;
};

function emptyRow(): DraftItem {
  return {
    key: Math.random().toString(36).slice(2),
    product_id: "", package_id: null, product_name: "", package: "",
    qty: 1, rate: 0, amount: 0, isCustomPkg: false,
  };
}

function NewInvoice() {
  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();
  const { data: packages } = usePackages();
  const { data: pricing } = useCustomPricing();

  const [invoiceNo, setInvoiceNo] = useState("INV-…");
  useEffect(() => { nextInvoiceNumber().then(setInvoiceNo).catch(() => {}); }, []);

  const [customerId, setCustomerId] = useState<string>("");
  const [customerQuery, setCustomerQuery] = useState("");
  const customer: Customer | undefined = customers.find(c => c.id === customerId);

  const customerSuggestions = useMemo(() => {
    const q = customerQuery.toLowerCase().trim();
    if (!q || customer) return [];
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.shop_name.toLowerCase().includes(q) ||
      c.phone.includes(q),
    ).slice(0, 6);
  }, [customerQuery, customers, customer]);

  const [date, setDate] = useState(todayISO());
  const [meta, setMeta] = useState({
    delivery_note: "", payment_terms: "Due on receipt",
    reference_no: "", buyer_order_no: "", delivery_date: "",
  });
  const [items, setItems] = useState<DraftItem[]>([emptyRow()]);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState(18);
  const [saving, setSaving] = useState(false);

  const packagesByProduct = useMemo(() => {
    const m = new Map<string, Package[]>();
    packages.forEach(p => { const a = m.get(p.product_id) ?? []; a.push(p); m.set(p.product_id, a); });
    return m;
  }, [packages]);

  function recalc(it: DraftItem): DraftItem {
    const amt = Math.round((it.qty || 0) * (it.rate || 0) * 100) / 100;
    return { ...it, amount: amt };
  }
  function updateItem(key: string, patch: Partial<DraftItem>) {
    setItems(prev => prev.map(r => (r.key === key ? recalc({ ...r, ...patch }) : r)));
  }

  function pickProduct(key: string, productId: string) {
    const p = products.find(x => x.id === productId);
    updateItem(key, {
      product_id: productId,
      product_name: p?.product_name ?? "",
      package_id: null, package: "", rate: 0, isCustomPkg: false,
    });
  }
  function pickPackage(key: string, pkgId: string) {
    if (pkgId === "__custom__") {
      updateItem(key, { package_id: null, package: "", rate: 0, isCustomPkg: true });
      return;
    }
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return;
    const rate = effectivePrice(customerId || null, pkg, pricing);
    updateItem(key, { package_id: pkg.id, package: pkg.package, rate, isCustomPkg: false });
  }

  const subtotal = useMemo(() => items.reduce((s, i) => s + (i.amount || 0), 0), [items]);
  const gstAmount = gstEnabled ? Math.round(subtotal * gstRate) / 100 : 0;
  const total = Math.round((subtotal + gstAmount) * 100) / 100;

  async function handleSave() {
    if (!customer) { toast.error("Select a customer"); return; }
    const validItems = items.filter(i => i.product_id && i.qty > 0 && i.package);
    if (validItems.length === 0) { toast.error("Add at least one item"); return; }

    // stock check
    for (const it of validItems) {
      if (it.package_id) {
        const pk = packages.find(p => p.id === it.package_id);
        if (pk && it.qty > pk.stock) {
          toast.error(`${it.product_name} ${it.package}: only ${pk.stock} in stock`);
          return;
        }
      }
    }

    const inv: Omit<Invoice, "id"> = {
      invoice_no: invoiceNo,
      customer_id: customer.id,
      customer_snapshot: customer,
      date,
      ...meta,
      delivery_date: meta.delivery_date || null,
      items: validItems.map<InvoiceItem>(({ key, isCustomPkg, ...rest }) => rest),
      subtotal: Math.round(subtotal * 100) / 100,
      gst_enabled: gstEnabled,
      gst_rate: gstRate,
      gst_amount: gstAmount,
      total,
    };

    setSaving(true);
    try {
      const saved = await createInvoice(inv);
      invalidate(qk.invoices, qk.packages);
      toast.success(`${saved.invoice_no} created`);
      navigate({ to: "/invoices/$id", params: { id: saved.id } });
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <AppShell>
      <div className="p-4 md:p-6 pb-24 max-w-6xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">New Invoice</h1>
          <p className="text-sm text-muted-foreground">Number: <span className="font-mono">{invoiceNo}</span></p>
        </div>

        {/* Customer */}
        <section className="rounded-xl border border-border bg-card p-4 grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Label>Customer (search by name / shop / phone)</Label>
            <Input
              ref={inputRef}
              value={customer ? `${customer.name}${customer.shop_name ? " · " + customer.shop_name : ""}` : customerQuery}
              onChange={e => { setCustomerId(""); setCustomerQuery(e.target.value); }}
              onFocus={e => { if (customer) { setCustomerId(""); setCustomerQuery(""); e.target.select(); } }}
              placeholder="Type to search…"
              className="mt-1"
            />
            {customerSuggestions.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-auto">
                {customerSuggestions.map(c => (
                  <button key={c.id} type="button"
                    onClick={() => { setCustomerId(c.id); setCustomerQuery(""); }}
                    className="w-full text-left px-3 py-2 hover:bg-accent text-sm border-b border-border last:border-0">
                    <div className="font-semibold">{c.name} {c.shop_name && <span className="text-muted-foreground font-normal">· {c.shop_name}</span>}</div>
                    <div className="text-xs text-muted-foreground">{c.phone || "—"} {c.gst && `· ${c.gst}`}</div>
                  </button>
                ))}
              </div>
            )}
            {customer && (
              <div className="mt-2 text-xs text-muted-foreground">
                {customer.phone} {customer.gst && `· ${customer.gst}`}<br />
                {customer.address}
              </div>
            )}
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" />
          </div>
        </section>

        {/* Meta */}
        <section className="rounded-xl border border-border bg-card p-4 grid md:grid-cols-3 gap-3">
          {([
            ["delivery_note", "Delivery Note"],
            ["payment_terms", "Payment Terms"],
            ["reference_no", "Reference No."],
            ["buyer_order_no", "Buyer Order No."],
          ] as const).map(([k, l]) => (
            <div key={k}>
              <Label>{l}</Label>
              <Input value={meta[k]} onChange={e => setMeta({ ...meta, [k]: e.target.value })} className="mt-1" />
            </div>
          ))}
          <div>
            <Label>Delivery Date</Label>
            <Input type="date" value={meta.delivery_date} onChange={e => setMeta({ ...meta, delivery_date: e.target.value })} className="mt-1" />
          </div>
        </section>

        {/* Items */}
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Items</h2>
            <Button size="sm" variant="outline" onClick={() => setItems([...items, emptyRow()])}>
              <Plus className="size-4 mr-1" /> Add Row
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="text-left px-2 py-2 w-10">#</th>
                  <th className="text-left px-2 py-2">Product</th>
                  <th className="text-left px-2 py-2 w-40">Package</th>
                  <th className="text-right px-2 py-2 w-20">Qty</th>
                  <th className="text-right px-2 py-2 w-28">Rate</th>
                  <th className="text-right px-2 py-2 w-28">Amount</th>
                  <th className="px-2 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => {
                  const pkgs = it.product_id ? (packagesByProduct.get(it.product_id) ?? []) : [];
                  const currentPkg = it.package_id ? packages.find(p => p.id === it.package_id) : undefined;
                  const stockWarn = currentPkg && it.qty > currentPkg.stock;
                  return (
                    <tr key={it.key} className="border-t border-border align-top">
                      <td className="px-2 py-2 text-muted-foreground pt-3.5">{i + 1}</td>
                      <td className="px-2 py-2">
                        <select value={it.product_id} onChange={e => pickProduct(it.key, e.target.value)}
                          className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm">
                          <option value="">— Select product —</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        {it.product_id && !it.isCustomPkg ? (
                          <select value={it.package_id ?? ""} onChange={e => pickPackage(it.key, e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm">
                            <option value="">— Package —</option>
                            {pkgs.map(pk => <option key={pk.id} value={pk.id}>{pk.package} (₹{pk.price}, stk {pk.stock})</option>)}
                            <option value="__custom__">+ Custom…</option>
                          </select>
                        ) : it.isCustomPkg ? (
                          <div className="space-y-1">
                            <div className="flex gap-1 flex-wrap">
                              {PREDEFINED_PACKAGES.map(s => (
                                <button key={s} type="button" onClick={() => updateItem(it.key, { package: s })}
                                  className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${it.package === s ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                                  {s}
                                </button>
                              ))}
                            </div>
                            <Input value={it.package} onChange={e => updateItem(it.key, { package: e.target.value })} placeholder="e.g. 750ml" className="h-8" />
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground pt-2">Pick product first</div>
                        )}
                        {stockWarn && <div className="text-[11px] text-destructive mt-1">Qty exceeds stock ({currentPkg!.stock})</div>}
                      </td>
                      <td className="px-2 py-2">
                        <Input type="number" min={0} value={it.qty} onChange={e => updateItem(it.key, { qty: Number(e.target.value) })} className="text-right tabular" />
                      </td>
                      <td className="px-2 py-2">
                        <Input type="number" min={0} step="0.01" value={it.rate}
                          readOnly={!it.isCustomPkg && !!it.package_id}
                          onChange={e => updateItem(it.key, { rate: Number(e.target.value) })}
                          className="text-right tabular" />
                      </td>
                      <td className="px-2 py-2 text-right tabular font-semibold pt-4">{formatINR(it.amount)}</td>
                      <td className="px-2 py-2 pt-3">
                        <button onClick={() => setItems(items.length === 1 ? [emptyRow()] : items.filter(r => r.key !== it.key))}
                          className="p-1.5 rounded text-destructive hover:bg-destructive/10">
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Totals */}
        <section className="rounded-xl border border-border bg-card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Switch checked={gstEnabled} onCheckedChange={setGstEnabled} id="gst" />
            <Label htmlFor="gst" className="cursor-pointer">Apply GST</Label>
            {gstEnabled && (
              <div className="flex items-center gap-1">
                <Input type="number" value={gstRate} onChange={e => setGstRate(Number(e.target.value))} className="w-20 text-right tabular" />
                <span className="text-sm">%</span>
              </div>
            )}
          </div>
          <div className="text-right space-y-1 text-sm tabular min-w-[240px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(subtotal)}</span></div>
            {gstEnabled && <div className="flex justify-between"><span className="text-muted-foreground">GST @ {gstRate}%</span><span>{formatINR(gstAmount)}</span></div>}
            <div className="flex justify-between text-lg font-bold border-t border-border pt-2"><span>Total</span><span>{formatINR(total)}</span></div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Create Invoice"}</Button>
        </div>
      </div>
    </AppShell>
  );
}
