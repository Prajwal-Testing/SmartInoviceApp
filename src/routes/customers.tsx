import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useCustomers, useInvalidate, qk } from "@/lib/hooks";
import { upsertCustomer, deleteCustomer } from "@/lib/api";
import type { Customer } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — SmartInvoice" }] }),
  component: CustomersPage,
});

const empty: Customer = { id: "", name: "", shop_name: "", phone: "", gst: "", address: "" };

function CustomersPage() {
  const { data: customers } = useCustomers();
  const invalidate = useInvalidate();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Customer>(empty);
  const [q, setQ] = useState("");

  const filtered = customers.filter(c =>
    !q ||
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.shop_name.toLowerCase().includes(q.toLowerCase()) ||
    c.phone.includes(q) ||
    c.gst.toLowerCase().includes(q.toLowerCase()),
  );

  async function save() {
    if (!draft.name.trim()) { toast.error("Name is required"); return; }
    try {
      await upsertCustomer(draft);
      toast.success("Saved");
      invalidate(qk.customers);
      setOpen(false);
    } catch (e: any) { toast.error(e.message ?? "Save failed"); }
  }

  async function remove(c: Customer) {
    if (!confirm(`Delete ${c.name}?`)) return;
    try { await deleteCustomer(c.id); toast.success("Deleted"); invalidate(qk.customers); }
    catch (e: any) { toast.error(e.message ?? "Delete failed"); }
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 pb-24 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
            <p className="text-sm text-muted-foreground">{customers.length} total</p>
          </div>
          <Button onClick={() => { setDraft(empty); setOpen(true); }}>
            <Plus className="size-4 mr-1" /> Add Customer
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, shop, phone, GST" className="pl-8" />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No customers.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5">Name</th>
                  <th className="text-left px-4 py-2.5">Shop</th>
                  <th className="text-left px-4 py-2.5">Phone</th>
                  <th className="text-left px-4 py-2.5">GSTIN</th>
                  <th className="text-left px-4 py-2.5">Address</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t border-border hover:bg-accent/30">
                    <td className="px-4 py-2.5 font-semibold">{c.name}</td>
                    <td className="px-4 py-2.5">{c.shop_name || "—"}</td>
                    <td className="px-4 py-2.5">{c.phone || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{c.gst || "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{c.address || "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => { setDraft(c); setOpen(true); }} className="p-1.5 rounded hover:bg-accent"><Pencil className="size-4" /></button>
                        <button onClick={() => remove(c)} className="p-1.5 rounded text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? "Edit" : "New"} Customer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="mt-1" autoFocus /></div>
            <div><Label>Shop Name</Label><Input value={draft.shop_name} onChange={e => setDraft({ ...draft, shop_name: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} className="mt-1" /></div>
              <div><Label>GSTIN</Label><Input value={draft.gst} onChange={e => setDraft({ ...draft, gst: e.target.value })} className="mt-1 font-mono" /></div>
            </div>
            <div><Label>Address</Label><Input value={draft.address} onChange={e => setDraft({ ...draft, address: e.target.value })} className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
