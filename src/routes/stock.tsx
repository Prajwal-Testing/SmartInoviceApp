import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { usePackages, useProducts, useInvalidate, qk } from "@/lib/hooks";
import { setPackageStock } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/stock")({
  head: () => ({ meta: [{ title: "Stock — SmartInvoice" }] }),
  component: StockPage,
});

function StockPage() {
  const { data: products } = useProducts();
  const { data: packages } = usePackages();
  const invalidate = useInvalidate();
  const [q, setQ] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});

  const productById = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const rows = packages
    .map(pk => ({ ...pk, product_name: productById.get(pk.product_id)?.product_name ?? "—" }))
    .filter(r => !q ||
      r.product_name.toLowerCase().includes(q.toLowerCase()) ||
      r.package.toLowerCase().includes(q.toLowerCase()),
    )
    .sort((a, b) =>
      a.product_name.localeCompare(b.product_name) || a.package.localeCompare(b.package),
    );

  async function saveOne(id: string) {
    const v = edits[id];
    if (v === undefined) return;
    try {
      await setPackageStock(id, Number(v));
      toast.success("Stock updated");
      setEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
      invalidate(qk.packages);
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 pb-24 space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Stock Management</h1>
          <p className="text-sm text-muted-foreground">Update stock per package. Rows under 5 highlighted.</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search product or package" className="pl-8" />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2.5">Product</th>
                <th className="text-left px-4 py-2.5">Package</th>
                <th className="text-right px-4 py-2.5">Current</th>
                <th className="text-right px-4 py-2.5 w-40">Update To</th>
                <th className="px-4 py-2.5 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No packages.</td></tr>
              )}
              {rows.map(r => {
                const low = r.stock < 5;
                const v = edits[r.id];
                const dirty = v !== undefined && v !== "" && Number(v) !== r.stock;
                return (
                  <tr key={r.id} className={`border-t border-border ${low ? "bg-warning/5" : ""}`}>
                    <td className="px-4 py-2.5 font-medium">{r.product_name}</td>
                    <td className="px-4 py-2.5">{r.package}</td>
                    <td className={`px-4 py-2.5 text-right tabular font-semibold ${low ? "text-warning" : ""}`}>{r.stock}</td>
                    <td className="px-4 py-2.5">
                      <Input type="number" min={0} className="text-right tabular h-8"
                        defaultValue={r.stock}
                        onChange={e => setEdits(prev => ({ ...prev, [r.id]: e.target.value }))} />
                    </td>
                    <td className="px-4 py-2.5">
                      <Button size="sm" variant={dirty ? "default" : "outline"} disabled={!dirty} onClick={() => saveOne(r.id)}>
                        <Save className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
