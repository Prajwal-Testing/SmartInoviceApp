import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, FileText, Users, Package, Plus, Receipt, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/products", label: "Products", icon: Package },
  { to: "/stock", label: "Stock", icon: Boxes },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: s => s.location.pathname });

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="no-print hidden md:flex w-60 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-sidebar-border">
          <div className="size-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Receipt className="size-5" />
          </div>
          <div>
            <div className="font-display font-bold text-base leading-none">SmartInvoice</div>
            <div className="text-[11px] opacity-70 mt-1">GST Billing & Inventory</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link key={to} to={to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "opacity-80 hover:bg-sidebar-accent/60 hover:opacity-100",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 text-[11px] opacity-60 border-t border-sidebar-border">
          Developed by Prajwal
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="no-print h-14 border-b border-border bg-card/60 backdrop-blur flex items-center justify-between px-4 md:px-6">
          <div className="md:hidden font-display font-bold flex items-center gap-2">
            <Receipt className="size-5 text-primary" /> SmartInvoice
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">
            Maruti Chemical — Mumbai
          </div>
          <Link to="/invoices/new" className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 transition">
            <Plus className="size-4" /> New Invoice
          </Link>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>

        <nav className="md:hidden no-print fixed bottom-0 inset-x-0 bg-sidebar text-sidebar-foreground border-t border-sidebar-border flex justify-around py-1.5 z-40">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link key={to} to={to}
                className={cn(
                  "flex flex-col items-center text-[10px] px-2 py-1 rounded",
                  active ? "text-primary-foreground bg-sidebar-accent" : "opacity-75",
                )}
              >
                <Icon className="size-4 mb-0.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
