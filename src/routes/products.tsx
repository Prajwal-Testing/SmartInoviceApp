import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useCustomers, useCustomPricing, usePackages, useProducts, useInvalidate, qk } from "@/lib/hooks";
import { upsertProduct, deleteProduct, upsertPackage, deletePackage, setCustomPrice, removeCustomPrice } from "@/lib/api";
import type { Product, Package } from "@/lib/types";
import { PREDEFINED_PACKAGES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Tag, ChevronDown, ChevronRight } from "lucide-react";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Products — SmartInvoice" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products } = useProducts();
  const { data: packages } = usePackages();
  const invalidate = useInvalidate();
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [prodOpen, setProdOpen] = useState(false);
  const [prodDraft, setProdDraft] = useState<Product>({ id: "", product_name: "" });

  const [pkgOpen, setPkgOpen] = useState(false);
  const [pkgDraft, setPkgDraft] = useState<Package>({ id: "", product_id: "", package: "", price: 0, stock: 0 });

  const [priceOpen, setPriceOpen] = useState(false);
  const [pricePackage, setPricePackage] = useState<Package | null>(null);

  const filtered = products.filter(p => !q || p.product_name.toLowerCase().includes(q.toLowerCase()));
  const packagesByProduct = useMemo(() => {
    const m = new Map<string, Package[]>();
    packages.forEach(pk => {
      const arr = m.get(pk.product_id) ?? [];
      arr.push(pk); m.set(pk.product_id, arr);
    });
    return m;
  }, [packages]);

  function toggle(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  }

  async function saveProduct() {
    if (!prodDraft.product_name.trim()) { toast.error("Product name required"); return; }
    try { await upsertProduct(prodDraft); toast.success("Saved"); invalidate(qk.products); setProdOpen(false); }
    catch (e: any) { toast.error(e.message); }
  }

  async function removeProduct(p: Product) {
    if (!confirm(`Delete ${p.product_name} and all its packages?`)) return;
    try { await deleteProduct(p.id); toast.success("Deleted"); invalidate(qk.products, qk.packages); }
    catch (e: any) { toast.error(e.message); }
  }

  async function savePackage() {
    if (!pkgDraft.package.trim()) { toast.error("Package required"); return; }
    try { await upsertPackage(pkgDraft); toast.success("Saved"); invalidate(qk.packages); setPkgOpen(false); }
    catch (e: any) { toast.error(e.message); }
  }

  async function removePkg(p: Package) {
    if (!confirm(`Delete package ${p.package}?`)) return;
    try { await deletePackage(p.id); toast.success("Deleted"); invalidate(qk.packages); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 pb-24 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground">{products.length} products · {packages.length} packages</p>
          </div>
          <Button onClick={() => { setProdDraft({ id: "", product_name: "" }); setProdOpen(true); }}>
            <Plus className="size-4 mr-1" /> Add Product
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products" className="pl-8" />
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {filtered.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No products.</div>}
          {filtered.map(p => {
            const pkgs = packagesByProduct.get(p.id) ?? [];
            const isOpen = expanded.has(p.id);
            return (
              <div key={p.id}>
                <div className="flex items-center px-4 py-3 gap-2">
                  <button onClick={() => toggle(p.id)} className="p-1 rounded hover:bg-accent">
                    {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  </button>
                  <div className="flex-1 font-semibold">{p.product_name}</div>
                  <div className="text-xs text-muted-foreground">{pkgs.length} packages</div>
                  <button onClick={() => { setPkgDraft({ id: "", product_id: p.id, package: "", price: 0, stock: 0 }); setPkgOpen(true); }} className="text-xs px-2 py-1 rounded border border-border hover:bg-accent flex items-center gap-1">
                    <Plus className="size-3" /> Package
                  </button>
                  <button onClick={() => { setProdDraft(p); setProdOpen(true); }} className="p-1.5 rounded hover:bg-accent"><Pencil className="size-4" /></button>
                  <button onClick={() => removeProduct(p)} className="p-1.5 rounded text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                </div>
                {isOpen && (
                  <div className="bg-muted/30 px-4 py-2">
                    {pkgs.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-3 text-center">No packages yet — add one above.</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="text-xs uppercase text-muted-foreground">
                          <tr><th className="text-left py-1.5">Package</th><th className="text-right">Price</th><th className="text-right">Stock</th><th></th></tr>
                        </thead>
                        <tbody>
                          {pkgs.map(pk => (
                            <tr key={pk.id} className="border-t border-border/60">
                              <td className="py-2 font-medium">{pk.package}</td>
                              <td className="py-2 text-right tabular">{formatINR(pk.price)}</td>
                              <td className={`py-2 text-right tabular font-semibold ${pk.stock < 5 ? "text-warning" : ""}`}>{pk.stock}</td>
                              <td className="py-2 text-right">
                                <button onClick={() => { setPricePackage(pk); setPriceOpen(true); }} className="p-1.5 rounded hover:bg-accent" title="Custom pricing"><Tag className="size-4" /></button>
                                <button onClick={() => { setPkgDraft(pk); setPkgOpen(true); }} className="p-1.5 rounded hover:bg-accent"><Pencil className="size-4" /></button>
                                <button onClick={() => removePkg(pk)} className="p-1.5 rounded text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={prodOpen} onOpenChange={setProdOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{prodDraft.id ? "Edit" : "New"} Product</DialogTitle></DialogHeader>
          <div><Label>Name *</Label><Input value={prodDraft.product_name} onChange={e => setProdDraft({ ...prodDraft, product_name: e.target.value })} className="mt-1" autoFocus /></div>
          <DialogFooter><Button variant="outline" onClick={() => setProdOpen(false)}>Cancel</Button><Button onClick={saveProduct}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pkgOpen} onOpenChange={setPkgOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{pkgDraft.id ? "Edit" : "New"} Package</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Package size *</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {PREDEFINED_PACKAGES.map(s => (
                  <button key={s} type="button" onClick={() => setPkgDraft({ ...pkgDraft, package: s })}
                    className={`px-3 py-1.5 rounded-md border text-xs font-semibold ${pkgDraft.package === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-accent"}`}>
                    {s}
                  </button>
                ))}
              </div>
              <Input value={pkgDraft.package} onChange={e => setPkgDraft({ ...pkgDraft, package: e.target.value })} placeholder="Or custom (e.g. 750ml)" className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price (₹)</Label><Input type="number" min={0} step="0.01" value={pkgDraft.price} onChange={e => setPkgDraft({ ...pkgDraft, price: Number(e.target.value) })} className="mt-1 text-right tabular" /></div>
              <div><Label>Stock</Label><Input type="number" min={0} value={pkgDraft.stock} onChange={e => setPkgDraft({ ...pkgDraft, stock: Number(e.target.value) })} className="mt-1 text-right tabular" /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setPkgOpen(false)}>Cancel</Button><Button onClick={savePackage}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomPricingDialog open={priceOpen} onClose={() => setPriceOpen(false)} pkg={pricePackage} />
    </AppShell>
  );
}

function CustomPricingDialog({ open, onClose, pkg }: { open: boolean; onClose: () => void; pkg: Package | null }) {
  const { data: customers } = useCustomers();
  const { data: pricing } = useCustomPricing();
  const invalidate = useInvalidate();

  async function save(customer_id: string, val: string) {
    if (!pkg) return;
    try {
      if (val.trim() === "") await removeCustomPrice(customer_id, pkg.id);
      else await setCustomPrice(customer_id, pkg.id, Number(val));
      invalidate(qk.pricing);
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Custom Pricing — {pkg?.package}</DialogTitle></DialogHeader>
        {pkg && (
          <div className="space-y-2 max-h-96 overflow-auto">
            {customers.length === 0 && <p className="text-sm text-muted-foreground">No customers yet.</p>}
            {customers.map(c => {
              const cp = pricing.find(x => x.customer_id === c.id && x.package_id === pkg.id);
              return (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="flex-1 text-sm truncate">{c.name} <span className="text-muted-foreground">{c.shop_name && `· ${c.shop_name}`}</span></div>
                  <Input type="number" min={0} step="0.01" placeholder={`₹${pkg.price}`} defaultValue={cp?.custom_price ?? ""}
                    onBlur={e => save(c.id, e.target.value)}
                    className="w-32 text-right tabular" />
                </div>
              );
            })}
          </div>
        )}
        <DialogFooter><Button onClick={onClose}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
