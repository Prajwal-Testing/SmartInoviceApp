import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useCustomers, useInvoices, usePackages, useProducts } from "@/lib/hooks";
import { formatINR, formatDate } from "@/lib/format";
import { ArrowUpRight, Users, Package, IndianRupee, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — SmartInvoice" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: invoices } = useInvoices();
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();
  const { data: packages } = usePackages();

  const totalSales = invoices.reduce((s, i) => s + i.total, 0);
  const now = new Date();
  const monthly = invoices
    .filter(i => { const d = new Date(i.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
    .reduce((s, i) => s + i.total, 0);

  const productById = new Map(products.map(p => [p.id, p]));
  const lowStock = packages
    .filter(p => p.stock < 5)
    .map(p => ({ ...p, product_name: productById.get(p.product_id)?.product_name ?? "—" }));

  const months: { label: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("en-IN", { month: "short" });
    const rev = invoices.filter(inv => {
      const id = new Date(inv.date);
      return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear();
    }).reduce((s, inv) => s + inv.total, 0);
    months.push({ label, revenue: Math.round(rev) });
  }

  // Top products by amount
  const byProduct = new Map<string, { qty: number; amount: number; name: string }>();
  invoices.forEach(inv => inv.items.forEach(it => {
    const k = it.product_id;
    const cur = byProduct.get(k) || { qty: 0, amount: 0, name: it.product_name };
    cur.qty += it.qty; cur.amount += it.amount;
    byProduct.set(k, cur);
  }));
  const topProducts = [...byProduct.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);

  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-6 pb-24">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Maruti Chemical — Sales, inventory & alerts</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Stat label="Total Sales" value={formatINR(totalSales)} icon={<IndianRupee className="size-4" />} accent="primary" />
          <Stat label="This Month" value={formatINR(monthly)} icon={<ArrowUpRight className="size-4" />} accent="success" />
          <Stat label="Customers" value={String(customers.length)} icon={<Users className="size-4" />} />
          <Stat label="Low Stock" value={String(lowStock.length)} icon={<AlertTriangle className="size-4" />} accent={lowStock.length ? "warning" : undefined} />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card title="Revenue — Last 6 Months" className="lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={months} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} className="text-xs" />
                  <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatINR(v)} />
                  <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Low Stock (<5)">
            {lowStock.length === 0 ? (
              <Empty icon={<Package className="size-5" />} text="All well-stocked" />
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.slice(0, 8).map(p => (
                  <li key={p.id} className="py-2 flex items-center justify-between text-sm">
                    <span className="truncate pr-2">{p.product_name} <span className="text-muted-foreground">· {p.package}</span></span>
                    <span className="tabular text-warning font-semibold">{p.stock}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card title="Top Products">
          {topProducts.length === 0 ? <Empty text="No sales yet" /> : (
            <ul className="divide-y divide-border">
              {topProducts.map((p, i) => (
                <li key={i} className="py-2 flex items-center justify-between text-sm">
                  <span className="truncate pr-2">{p.name}</span>
                  <span className="tabular text-muted-foreground text-xs mr-3">Qty {p.qty}</span>
                  <span className="tabular font-semibold">{formatINR(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent Invoices">
          {invoices.length === 0 ? (
            <Empty text="No invoices yet" cta={<Link to="/invoices/new" className="text-primary text-sm font-medium hover:underline">Create your first invoice →</Link>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Invoice</th>
                    <th className="text-left">Customer</th>
                    <th className="text-left">Date</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 8).map(inv => (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                      <td className="py-2">
                        <Link to="/invoices/$id" params={{ id: inv.id }} className="text-primary font-medium">{inv.invoice_no}</Link>
                      </td>
                      <td>{inv.customer_snapshot?.name}</td>
                      <td>{formatDate(inv.date)}</td>
                      <td className="text-right tabular font-semibold">{formatINR(inv.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: "primary" | "success" | "warning" }) {
  const tone =
    accent === "primary" ? "bg-primary/10 text-primary" :
    accent === "success" ? "bg-success/10 text-success" :
    accent === "warning" ? "bg-warning/15 text-warning-foreground" :
    "bg-muted text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className={`size-8 rounded-md grid place-items-center ${tone}`}>{icon}</div>
      </div>
      <div className="mt-2 text-xl md:text-2xl font-bold tabular">{value}</div>
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-border bg-card p-4 ${className}`}>
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text, icon, cta }: { text: string; icon?: React.ReactNode; cta?: React.ReactNode }) {
  return (
    <div className="py-8 text-center text-sm text-muted-foreground">
      {icon && <div className="mx-auto mb-2 size-10 rounded-full bg-muted grid place-items-center">{icon}</div>}
      <div>{text}</div>
      {cta && <div className="mt-2">{cta}</div>}
    </div>
  );
}
