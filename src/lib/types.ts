export type Customer = {
  id: string;
  name: string;
  shop_name: string;
  phone: string;
  gst: string;
  address: string;
};

export type Product = {
  id: string;
  product_name: string;
};

export type Package = {
  id: string;
  product_id: string;
  package: string;
  price: number;
  stock: number;
};

export type CustomPricing = {
  id: string;
  customer_id: string;
  package_id: string;
  custom_price: number;
};

export type InvoiceItem = {
  product_id: string;
  package_id: string | null; // null when fully custom
  product_name: string;
  package: string;
  qty: number;
  rate: number;
  amount: number;
};

export type Invoice = {
  id: string;
  invoice_no: string;
  customer_id: string | null;
  customer_snapshot: Customer;
  date: string;
  delivery_note?: string;
  payment_terms?: string;
  reference_no?: string;
  buyer_order_no?: string;
  delivery_date?: string | null;
  items: InvoiceItem[];
  subtotal: number;
  gst_enabled: boolean;
  gst_rate: number;
  gst_amount: number;
  total: number;
};

export const COMPANY = {
  name: "Maruti Chemical",
  address: "Mumbai",
  phone: "9619988901",
  gst: "",
  tagline: "Quality you can trust",
} as const;

export const PREDEFINED_PACKAGES = ["500ml", "1L", "5L", "10L", "20L", "35L"] as const;
