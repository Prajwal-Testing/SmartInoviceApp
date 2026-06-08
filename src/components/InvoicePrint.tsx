import type { Invoice } from "@/lib/types";
import { COMPANY } from "@/lib/types";
import { formatNum, formatDate, numberToWordsINR } from "@/lib/format";

export function InvoicePrint({ invoice }: { invoice: Invoice }) {
  const c = invoice.customer_snapshot;
  const padRows = Math.max(0, 8 - invoice.items.length);

  return (
    <div className="invoice-sheet">
      <div className="inv-title">TAX INVOICE</div>

      <div className="grid grid-cols-2 inv-grid mb-3">
        <div className="p-3 border-r border-[color:var(--invoice-ink)]">
          <div className="font-display font-bold text-[15px] leading-tight">{COMPANY.name}</div>
          <div className="mt-1 whitespace-pre-line">{COMPANY.address}</div>
          <div className="mt-1"><span className="inv-label">Phone:</span> <span className="inv-value">{COMPANY.phone}</span></div>
          {COMPANY.gst && <div><span className="inv-label">GSTIN:</span> <span className="inv-value">{COMPANY.gst}</span></div>}
        </div>
        <div className="grid grid-cols-2">
          {[
            ["Invoice No.", invoice.invoice_no],
            ["Date", formatDate(invoice.date)],
            ["Delivery Note", invoice.delivery_note || "—"],
            ["Payment Terms", invoice.payment_terms || "—"],
            ["Reference No.", invoice.reference_no || "—"],
            ["Buyer Order No.", invoice.buyer_order_no || "—"],
            ["Delivery Date", invoice.delivery_date ? formatDate(invoice.delivery_date) : "—"],
            ["GSTIN", c.gst || "—"],
          ].map(([label, val], i, arr) => (
            <div key={label as string} className="px-2 py-1.5" style={{
              borderRight: i % 2 === 0 ? "1px solid var(--invoice-ink)" : "0",
              borderBottom: i < arr.length - 2 ? "1px solid var(--invoice-ink)" : "0",
            }}>
              <div className="inv-label">{label}</div>
              <div className="inv-value truncate">{val}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="inv-grid mb-3 p-3">
        <div className="inv-label mb-1">Bill To</div>
        <div className="font-display font-bold text-[14px]">{c.name}{c.shop_name ? ` · ${c.shop_name}` : ""}</div>
        <div className="grid grid-cols-3 gap-x-4 mt-1">
          <div><span className="inv-label">Phone:</span> <span className="inv-value">{c.phone || "—"}</span></div>
          <div className="col-span-2"><span className="inv-label">GSTIN:</span> <span className="inv-value">{c.gst || "—"}</span></div>
        </div>
        <div className="mt-1"><span className="inv-label">Address:</span> <span className="inv-value">{c.address || "—"}</span></div>
      </div>

      <table className="inv-table">
        <thead>
          <tr>
            <th className="ctr" style={{ width: "6%" }}>Sr</th>
            <th style={{ width: "42%" }}>Product</th>
            <th className="ctr" style={{ width: "14%" }}>Package</th>
            <th className="num" style={{ width: "10%" }}>Qty</th>
            <th className="num" style={{ width: "12%" }}>Rate</th>
            <th className="num" style={{ width: "16%" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it, i) => (
            <tr key={i}>
              <td className="ctr">{i + 1}</td>
              <td>{it.product_name}</td>
              <td className="ctr">{it.package}</td>
              <td className="num">{formatNum(it.qty, 0)}</td>
              <td className="num">{formatNum(it.rate)}</td>
              <td className="num">{formatNum(it.amount)}</td>
            </tr>
          ))}
          {Array.from({ length: padRows }).map((_, i) => (
            <tr key={`pad-${i}`}>
              <td className="ctr">&nbsp;</td><td>&nbsp;</td><td className="ctr">&nbsp;</td>
              <td className="num">&nbsp;</td><td className="num">&nbsp;</td><td className="num">&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-12 mt-3 gap-3">
        <div className="col-span-7 inv-grid p-3">
          <div className="inv-label">Amount in Words</div>
          <div className="inv-value italic mt-0.5">{numberToWordsINR(invoice.total)}</div>
        </div>
        <div className="col-span-5 inv-grid">
          <Row label="Subtotal" value={formatNum(invoice.subtotal)} />
          {invoice.gst_enabled && <Row label={`GST @ ${invoice.gst_rate}%`} value={formatNum(invoice.gst_amount)} />}
          <Row label="Total" value={`₹ ${formatNum(invoice.total)}`} bold />
        </div>
      </div>

      <div className="grid grid-cols-2 mt-12 gap-6">
        <div><div className="border-t border-[color:var(--invoice-ink)] pt-1 text-center inv-label">Customer Signature</div></div>
        <div><div className="border-t border-[color:var(--invoice-ink)] pt-1 text-center inv-label">For {COMPANY.name}<br/>Authorized Signatory</div></div>
      </div>

      <div className="text-center mt-6 italic font-semibold">{COMPANY.tagline}</div>
      <div className="text-center mt-1 text-[9px] opacity-60">Developed by Prajwal</div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="grid grid-cols-2 px-3 py-1.5" style={{ borderBottom: bold ? "0" : "1px solid var(--invoice-ink)" }}>
      <div className={bold ? "font-bold" : ""}>{label}</div>
      <div className={`text-right tabular ${bold ? "font-bold text-[13px]" : ""}`}>{value}</div>
    </div>
  );
}
