export type Customer = {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
  billingAddress: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerFormValues = Omit<Customer, "id" | "createdAt" | "updatedAt">;

export type DocumentCustomerSnapshot = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
  billingAddress: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
};

export type QuotationStatus = "draft" | "sent" | "approved" | "rejected" | "converted";

export type InvoiceStatus = "draft" | "unpaid" | "paid" | "overdue" | "cancelled";

export type DocumentLineItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxPercent: number;
  lineTotal: number;
};

export type Quotation = {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  customerId: string;
  customerSnapshot: DocumentCustomerSnapshot;
  inquiryReference: string;
  status: QuotationStatus;
  items: DocumentLineItem[];
  subtotal: number;
  discount: number;
  taxTotal: number;
  shippingCharges: number;
  grandTotal: number;
  notes: string;
  termsAndConditions: string;
  paymentTerms: string;
  preparedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  quotationId: string | null;
  customerId: string;
  customerSnapshot: DocumentCustomerSnapshot;
  status: InvoiceStatus;
  items: DocumentLineItem[];
  subtotal: number;
  discount: number;
  taxTotal: number;
  shippingCharges: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  notes: string;
  paymentInstructions: string;
  bankDetails: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentSettings = {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyGstNumber: string;
  quotationPrefix: string;
  invoicePrefix: string;
  currencySymbol: string;
  bankDetails: string;
  paymentInstructions: string;
};

export type AdminStoragePayload = {
  customers: Customer[];
  quotations: Quotation[];
  invoices: Invoice[];
  settings: DocumentSettings;
};

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  companyName: "Vayu Packaging Solutions",
  companyEmail: "vayu.packagingsolutions@gmail.com",
  companyPhone: "+91 8511658600",
  companyAddress: "Ahmedabad, Gujarat, India",
  companyGstNumber: "",
  quotationPrefix: "VPS-Q",
  invoicePrefix: "VPS-I",
  currencySymbol: "₹",
  bankDetails: "",
  paymentInstructions: "Payment terms will be shared with the final document.",
};