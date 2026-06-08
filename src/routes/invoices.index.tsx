import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useInvoices, useInvalidate, qk } from "@/lib/hooks";
import { deleteInvoice } from "@/lib/api";
import { formatINR, formatDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Eye, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/invoices/")({
  head: () => ({ meta: [{ title: "Invoices — SmartInvoice" }] }),
  component: InvoicesList,
});

function InvoicesList() {
  const { data: invoices } = useInvoices();
  const invalidate = useInvalidate();
  const [q, setQ] = useState("");

  const filtered = invoices.filter(i =>
    !q ||
    i.invoice_no.toLowerCase().includes(q.toLowerCase()) ||
    i.customer_snapshot.name.toLowerCase().includes(q.toLowerCase()) ||
    (i.customer_snapshot.shop_name ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  async function remove(id: string, no: string) {
    if (!confirm(`Delete ${no}? Stock will be restored.`)) return;
    try { await deleteInvoice(id); toast.success("Deleted, stock restored"); invalidate(qk.invoices, qk.packages); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 pb-24 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground text-sm">{invoices.length} total</p>
          </div>
          <Link to="/invoices/new" className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90">
            <Plus className="size-4" /> New
          </Link>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by invoice # or customer" className="pl-8" />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No invoices found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5">Invoice</th>
                  <th className="text-left px-4 py-2.5">Customer</th>
                  <th className="text-left px-4 py-2.5">Date</th>
                  <th className="text-right px-4 py-2.5">Items</th>
                  <th className="text-right px-4 py-2.5">Total</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} className="border-t border-border hover:bg-accent/30">
                    <td className="px-4 py-2.5 font-semibold text-primary">{inv.invoice_no}</td>
                    <td className="px-4 py-2.5">
                      <div>{inv.customer_snapshot.name}</div>
                      {inv.customer_snapshot.shop_name && <div className="text-xs text-muted-foreground">{inv.customer_snapshot.shop_name}</div>}
                    </td>
                    <td className="px-4 py-2.5">{formatDate(inv.date)}</td>
                    <td className="px-4 py-2.5 text-right tabular">{inv.items.length}</td>
                    <td className="px-4 py-2.5 text-right tabular font-semibold">{formatINR(inv.total)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex gap-1">
                        <Link to="/invoices/$id" params={{ id: inv.id }} className="p-1.5 rounded hover:bg-accent" title="View">
                          <Eye className="size-4" />
                        </Link>
                        <button onClick={() => remove(inv.id, inv.invoice_no)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive" title="Delete">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
