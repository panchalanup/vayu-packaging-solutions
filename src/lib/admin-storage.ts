import { v4 as uuidv4 } from "uuid";

import {
  Customer,
  DEFAULT_DOCUMENT_SETTINGS,
  DocumentCustomerSnapshot,
  DocumentLineItem,
  DocumentSettings,
  Invoice,
  Quotation,
} from "@/types/admin-crm";

const STORAGE_KEYS = {
  customers: "admin_customers",
  quotations: "admin_quotations",
  invoices: "admin_invoices",
  settings: "admin_document_settings",
} as const;

const isBrowser = typeof window !== "undefined";

const readStorage = <T,>(key: string, fallback: T): T => {
  if (!isBrowser) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
};

const writeStorage = <T,>(key: string, value: T) => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const createRecordId = () => uuidv4();

export const getCustomers = () => readStorage<Customer[]>(STORAGE_KEYS.customers, []);

export const saveCustomers = (customers: Customer[]) => {
  writeStorage(STORAGE_KEYS.customers, customers);
};

export const upsertCustomer = (customer: Customer) => {
  const customers = getCustomers();
  const existingIndex = customers.findIndex((entry) => entry.id === customer.id);

  if (existingIndex >= 0) {
    customers[existingIndex] = customer;
  } else {
    customers.unshift(customer);
  }

  saveCustomers(customers);
  return customer;
};

export const deleteCustomer = (customerId: string) => {
  const customers = getCustomers().filter((customer) => customer.id !== customerId);
  saveCustomers(customers);
};

export const getCustomerById = (customerId: string) => {
  return getCustomers().find((customer) => customer.id === customerId) ?? null;
};

export const createCustomerSnapshot = (customer: Customer): DocumentCustomerSnapshot => ({
  companyName: customer.companyName,
  contactPerson: customer.contactPerson,
  email: customer.email,
  phone: customer.phone,
  gstNumber: customer.gstNumber,
  billingAddress: customer.billingAddress,
  shippingAddress: customer.shippingAddress,
  city: customer.city,
  state: customer.state,
  pincode: customer.pincode,
});

export const getQuotations = () => readStorage<Quotation[]>(STORAGE_KEYS.quotations, []);

export const saveQuotations = (quotations: Quotation[]) => {
  writeStorage(STORAGE_KEYS.quotations, quotations);
};

export const upsertQuotation = (quotation: Quotation) => {
  const quotations = getQuotations();
  const existingIndex = quotations.findIndex((entry) => entry.id === quotation.id);

  if (existingIndex >= 0) {
    quotations[existingIndex] = quotation;
  } else {
    quotations.unshift(quotation);
  }

  saveQuotations(quotations);
  return quotation;
};

export const deleteQuotation = (quotationId: string) => {
  const quotations = getQuotations().filter((quotation) => quotation.id !== quotationId);
  saveQuotations(quotations);
};

export const getQuotationById = (quotationId: string) => {
  return getQuotations().find((quotation) => quotation.id === quotationId) ?? null;
};

export const getInvoices = () => readStorage<Invoice[]>(STORAGE_KEYS.invoices, []);

export const saveInvoices = (invoices: Invoice[]) => {
  writeStorage(STORAGE_KEYS.invoices, invoices);
};

export const upsertInvoice = (invoice: Invoice) => {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex((entry) => entry.id === invoice.id);

  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.unshift(invoice);
  }

  saveInvoices(invoices);
  return invoice;
};

export const deleteInvoice = (invoiceId: string) => {
  const invoices = getInvoices().filter((invoice) => invoice.id !== invoiceId);
  saveInvoices(invoices);
};

export const getInvoiceById = (invoiceId: string) => {
  return getInvoices().find((invoice) => invoice.id === invoiceId) ?? null;
};

export const getDocumentSettings = () =>
  readStorage<DocumentSettings>(STORAGE_KEYS.settings, DEFAULT_DOCUMENT_SETTINGS);

export const saveDocumentSettings = (settings: DocumentSettings) => {
  writeStorage(STORAGE_KEYS.settings, settings);
};

const getHighestDocumentSequence = (numbers: string[], prefix: string) => {
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matcher = new RegExp(`^${escapedPrefix}-(\\d+)$`);

  return numbers.reduce((highest, number) => {
    const match = number.match(matcher);
    if (!match) {
      return highest;
    }

    const numericValue = Number(match[1]);
    return Number.isFinite(numericValue) ? Math.max(highest, numericValue) : highest;
  }, 0);
};

export const generateNextDocumentNumber = (prefix: string, existingNumbers: string[]) => {
  const nextSequence = getHighestDocumentSequence(existingNumbers, prefix) + 1;
  return `${prefix}-${String(nextSequence).padStart(4, "0")}`;
};

export const getNextQuotationNumber = () => {
  const settings = getDocumentSettings();
  const quotationNumbers = getQuotations().map((quotation) => quotation.quotationNumber);
  return generateNextDocumentNumber(settings.quotationPrefix, quotationNumbers);
};

export const getNextInvoiceNumber = () => {
  const settings = getDocumentSettings();
  const invoiceNumbers = getInvoices().map((invoice) => invoice.invoiceNumber);
  return generateNextDocumentNumber(settings.invoicePrefix, invoiceNumbers);
};

export const calculateLineTotal = (item: Pick<DocumentLineItem, "quantity" | "unitPrice" | "taxPercent">) => {
  const baseAmount = item.quantity * item.unitPrice;
  const taxAmount = (baseAmount * item.taxPercent) / 100;
  return Number((baseAmount + taxAmount).toFixed(2));
};

export const calculateDocumentTotals = (
  items: DocumentLineItem[],
  discount = 0,
  shippingCharges = 0,
) => {
  const subtotal = Number(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2));
  const taxTotal = Number(
    items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxPercent) / 100, 0).toFixed(2),
  );
  const grandTotal = Number((subtotal + taxTotal + shippingCharges - discount).toFixed(2));

  return {
    subtotal,
    taxTotal,
    shippingCharges: Number(shippingCharges.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    grandTotal,
  };
};