import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useInvoice, useInvalidate, qk } from "@/lib/hooks";
import { deleteInvoice } from "@/lib/api";
import { InvoicePrint } from "@/components/InvoicePrint";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/invoices/$id")({
  head: ({ params }) => ({ meta: [{ title: `Invoice ${params.id} — SmartInvoice` }] }),
  component: ViewInvoice,
});

function ViewInvoice() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const { data: invoice, isLoading } = useInvoice(id);

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-10 text-center"><Loader2 className="size-6 animate-spin mx-auto text-primary" /></div>
      </AppShell>
    );
  }

  if (!invoice) {
    return (
      <AppShell>
        <div className="p-10 text-center">
          <h2 className="text-lg font-semibold">Invoice not found</h2>
          <Link to="/invoices" className="text-primary text-sm mt-2 inline-block">Back to invoices</Link>
        </div>
      </AppShell>
    );
  }

  async function remove() {
    if (!confirm("Delete this invoice? Stock will be restored.")) return;
    try {
      await deleteInvoice(invoice!.id);
      invalidate(qk.invoices, qk.packages);
      toast.success("Invoice deleted");
      navigate({ to: "/invoices" });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <AppShell>
      <div className="no-print sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
        <Link to="/invoices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4 mr-1" /> Print / Save PDF
          </Button>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/40 hover:bg-destructive/10" onClick={remove}>
            <Trash2 className="size-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <div className="invoice-wrap p-4 md:p-8 bg-muted/40 min-h-[calc(100vh-3.5rem-3.25rem)] pb-24">
        <InvoicePrint invoice={invoice} />
        <div className="no-print text-center text-xs text-muted-foreground mt-4">
          Use <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border">Print</kbd> → "Save as PDF" for a print-perfect copy.
        </div>
      </div>
    </AppShell>
  );
}
