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
import { ADMIN_SHEETS_CONFIG } from "@/config/adminSheets";

const STORAGE_KEYS = {
  customers: "admin_customers",
  quotations: "admin_quotations",
  invoices: "admin_invoices",
  settings: "admin_document_settings",
  demoSeedVersion: "admin_demo_seed_version",
} as const;

const SHEET_NAMES = {
  customers: "Customers",
  quotations: "Quotations",
  invoices: "Invoices",
} as const;

const SHEETS_ENDPOINT = ADMIN_SHEETS_CONFIG.CRM_ENDPOINT;
const SHEETS_TOKEN = ADMIN_SHEETS_CONFIG.CRM_TOKEN;

const isBrowser = typeof window !== "undefined";
const DEMO_SEED_VERSION = "v1";
let hasCheckedDemoSeed = false;
let hasCheckedSheetDemoSeed = false;

const calculateDemoLineTotal = (quantity: number, unitPrice: number, taxPercent: number) => {
  const baseAmount = quantity * unitPrice;
  const taxAmount = (baseAmount * taxPercent) / 100;
  return Number((baseAmount + taxAmount).toFixed(2));
};

const calculateDemoTotals = (items: DocumentLineItem[], discount = 0, shippingCharges = 0) => {
  const subtotal = Number(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2));
  const taxTotal = Number(
    items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxPercent) / 100, 0).toFixed(2),
  );

  return {
    subtotal,
    taxTotal,
    discount: Number(discount.toFixed(2)),
    shippingCharges: Number(shippingCharges.toFixed(2)),
    grandTotal: Number((subtotal + taxTotal + shippingCharges - discount).toFixed(2)),
  };
};

const createDemoItem = (
  id: string,
  name: string,
  description: string,
  quantity: number,
  unit: string,
  unitPrice: number,
  taxPercent: number,
): DocumentLineItem => ({
  id,
  name,
  description,
  quantity,
  unit,
  unitPrice,
  taxPercent,
  lineTotal: calculateDemoLineTotal(quantity, unitPrice, taxPercent),
});

const createCustomerSnapshotFromCustomer = (customer: Customer): DocumentCustomerSnapshot => ({
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

const DEMO_CUSTOMERS: Customer[] = [
  {
    id: "demo-customer-1",
    companyName: "Apex Foods Pvt. Ltd.",
    contactPerson: "Rohit Sharma",
    email: "procurement@apexfoods.in",
    phone: "+91 98989 11001",
    gstNumber: "24AAECA1234K1ZQ",
    billingAddress: "402, Shreeji Corporate House, Prahladnagar, Ahmedabad",
    shippingAddress: "Unit 3, Changodar Industrial Estate, Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380015",
    notes: "Regular monthly order for FMCG mono cartons.",
    createdAt: "2026-03-08T10:15:00.000Z",
    updatedAt: "2026-04-02T09:30:00.000Z",
  },
  {
    id: "demo-customer-2",
    companyName: "GreenLeaf Organics",
    contactPerson: "Priya Nair",
    email: "ops@greenleaforganics.co",
    phone: "+91 98240 22002",
    gstNumber: "24BBBCG5678M1ZX",
    billingAddress: "12, Orchid Business Park, SG Highway, Ahmedabad",
    shippingAddress: "Plot 18, Sanand GIDC, Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "382110",
    notes: "Eco-friendly pouch packaging with low minimum order quantity.",
    createdAt: "2026-03-12T11:00:00.000Z",
    updatedAt: "2026-04-05T14:20:00.000Z",
  },
  {
    id: "demo-customer-3",
    companyName: "Nimbus Electronics",
    contactPerson: "Arjun Patel",
    email: "sourcing@nimbuselectronics.in",
    phone: "+91 98795 33003",
    gstNumber: "24CCCDN9012P1ZA",
    billingAddress: "905, Titanium Heights, Thaltej, Ahmedabad",
    shippingAddress: "Warehouse B4, Naroda Industrial Zone, Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "382330",
    notes: "High-value rigid boxes with foam inserts.",
    createdAt: "2026-03-20T08:40:00.000Z",
    updatedAt: "2026-04-09T16:05:00.000Z",
  },
  {
    id: "demo-customer-4",
    companyName: "Stellar Pharma Labs",
    contactPerson: "Neha Trivedi",
    email: "purchase@stellarpharma.in",
    phone: "+91 99250 44004",
    gstNumber: "24DDDES3456Q1ZL",
    billingAddress: "601, Medicity Tower, Science City Road, Ahmedabad",
    shippingAddress: "Plant 2, Bavla Pharma Park, Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "382220",
    notes: "Requires batch coding and compliance-ready shipper cartons.",
    createdAt: "2026-03-28T12:10:00.000Z",
    updatedAt: "2026-04-11T10:45:00.000Z",
  },
];

const DEMO_QUOTATIONS: Quotation[] = [
  (() => {
    const customer = DEMO_CUSTOMERS[0];
    const items = [
      createDemoItem("demo-q1-item-1", "Corrugated Shipping Box", "5-ply brown box, 12x10x8 inch", 500, "pcs", 12, 18),
      createDemoItem("demo-q1-item-2", "Printed Product Sleeve", "Single color sleeve for retail packs", 500, "pcs", 4.5, 18),
    ];
    const totals = calculateDemoTotals(items, 200, 350);

    return {
      id: "demo-quotation-1",
      quotationNumber: "VPS-Q-0001",
      quotationDate: "2026-04-01",
      validUntil: "2026-04-15",
      customerId: customer.id,
      customerSnapshot: createCustomerSnapshotFromCustomer(customer),
      inquiryReference: "INQ-APEX-2401",
      status: "sent",
      items,
      ...totals,
      notes: "Lead time: 7 working days after artwork approval.",
      termsAndConditions: "Prices are ex-works Ahmedabad. Freight extra as applicable.",
      paymentTerms: "50% advance, balance before dispatch.",
      preparedBy: "Anup Panchal",
      createdAt: "2026-04-01T10:30:00.000Z",
      updatedAt: "2026-04-01T10:30:00.000Z",
    };
  })(),
  (() => {
    const customer = DEMO_CUSTOMERS[1];
    const items = [
      createDemoItem("demo-q2-item-1", "Stand-up Zip Pouch", "Matte finish, 250gm capacity", 2000, "pcs", 2.2, 5),
      createDemoItem("demo-q2-item-2", "Roll Label", "Waterproof label, 2x2 inch", 2000, "pcs", 0.9, 12),
    ];
    const totals = calculateDemoTotals(items, 100, 0);

    return {
      id: "demo-quotation-2",
      quotationNumber: "VPS-Q-0002",
      quotationDate: "2026-04-03",
      validUntil: "2026-04-20",
      customerId: customer.id,
      customerSnapshot: createCustomerSnapshotFromCustomer(customer),
      inquiryReference: "INQ-GREEN-2403",
      status: "approved",
      items,
      ...totals,
      notes: "Eco-solvent inks as requested.",
      termsAndConditions: "Quotation valid subject to final artwork and dimensions.",
      paymentTerms: "30 days credit from invoice date.",
      preparedBy: "Anup Panchal",
      createdAt: "2026-04-03T09:00:00.000Z",
      updatedAt: "2026-04-04T15:15:00.000Z",
    };
  })(),
  (() => {
    const customer = DEMO_CUSTOMERS[2];
    const items = [
      createDemoItem("demo-q3-item-1", "Premium Rigid Box", "Magnetic closure rigid box", 300, "pcs", 48, 18),
      createDemoItem("demo-q3-item-2", "Custom Foam Insert", "Die-cut EVA insert for electronics", 300, "pcs", 6, 18),
    ];
    const totals = calculateDemoTotals(items, 500, 750);

    return {
      id: "demo-quotation-3",
      quotationNumber: "VPS-Q-0003",
      quotationDate: "2026-04-06",
      validUntil: "2026-04-25",
      customerId: customer.id,
      customerSnapshot: createCustomerSnapshotFromCustomer(customer),
      inquiryReference: "INQ-NIMBUS-2406",
      status: "draft",
      items,
      ...totals,
      notes: "Prototype sample to be approved before bulk run.",
      termsAndConditions: "Tooling charges included in one-time setup.",
      paymentTerms: "60% advance, 40% before dispatch.",
      preparedBy: "Anup Panchal",
      createdAt: "2026-04-06T11:25:00.000Z",
      updatedAt: "2026-04-06T11:25:00.000Z",
    };
  })(),
  (() => {
    const customer = DEMO_CUSTOMERS[3];
    const items = [
      createDemoItem("demo-q4-item-1", "Mailer Carton", "Tamper evident shipper carton", 800, "pcs", 9, 12),
      createDemoItem("demo-q4-item-2", "Tamper Proof Tape", "Printed BOPP tape 2 inch", 30, "roll", 110, 18),
    ];
    const totals = calculateDemoTotals(items, 0, 250);

    return {
      id: "demo-quotation-4",
      quotationNumber: "VPS-Q-0004",
      quotationDate: "2026-04-08",
      validUntil: "2026-04-30",
      customerId: customer.id,
      customerSnapshot: createCustomerSnapshotFromCustomer(customer),
      inquiryReference: "INQ-STELLAR-2408",
      status: "rejected",
      items,
      ...totals,
      notes: "Customer requested alternate GSM option.",
      termsAndConditions: "Rates include standard 2-color printing.",
      paymentTerms: "100% advance for first order.",
      preparedBy: "Anup Panchal",
      createdAt: "2026-04-08T13:10:00.000Z",
      updatedAt: "2026-04-09T17:40:00.000Z",
    };
  })(),
];

const DEMO_INVOICES: Invoice[] = [
  (() => {
    const quotation = DEMO_QUOTATIONS[0];

    return {
      id: "demo-invoice-1",
      invoiceNumber: "VPS-I-0001",
      invoiceDate: "2026-04-05",
      dueDate: "2026-04-12",
      quotationId: quotation.id,
      customerId: quotation.customerId,
      customerSnapshot: quotation.customerSnapshot,
      status: "paid",
      items: quotation.items,
      subtotal: quotation.subtotal,
      discount: quotation.discount,
      taxTotal: quotation.taxTotal,
      shippingCharges: quotation.shippingCharges,
      grandTotal: quotation.grandTotal,
      amountPaid: quotation.grandTotal,
      balanceDue: 0,
      notes: "Paid via bank transfer on dispatch date.",
      paymentInstructions: "Thank you for your prompt payment.",
      bankDetails: "HDFC Bank - A/C 1234567890 - IFSC HDFC0001234",
      createdAt: "2026-04-05T16:20:00.000Z",
      updatedAt: "2026-04-10T09:20:00.000Z",
    };
  })(),
  (() => {
    const quotation = DEMO_QUOTATIONS[1];

    return {
      id: "demo-invoice-2",
      invoiceNumber: "VPS-I-0002",
      invoiceDate: "2026-04-07",
      dueDate: "2026-04-22",
      quotationId: quotation.id,
      customerId: quotation.customerId,
      customerSnapshot: quotation.customerSnapshot,
      status: "unpaid",
      items: quotation.items,
      subtotal: quotation.subtotal,
      discount: quotation.discount,
      taxTotal: quotation.taxTotal,
      shippingCharges: quotation.shippingCharges,
      grandTotal: quotation.grandTotal,
      amountPaid: 0,
      balanceDue: quotation.grandTotal,
      notes: "Awaiting payment as per agreed credit terms.",
      paymentInstructions: "Please transfer payment within due date to avoid late fees.",
      bankDetails: "HDFC Bank - A/C 1234567890 - IFSC HDFC0001234",
      createdAt: "2026-04-07T12:00:00.000Z",
      updatedAt: "2026-04-07T12:00:00.000Z",
    };
  })(),
  (() => {
    const quotation = DEMO_QUOTATIONS[2];

    return {
      id: "demo-invoice-3",
      invoiceNumber: "VPS-I-0003",
      invoiceDate: "2026-04-09",
      dueDate: "2026-04-16",
      quotationId: quotation.id,
      customerId: quotation.customerId,
      customerSnapshot: quotation.customerSnapshot,
      status: "overdue",
      items: quotation.items,
      subtotal: quotation.subtotal,
      discount: quotation.discount,
      taxTotal: quotation.taxTotal,
      shippingCharges: quotation.shippingCharges,
      grandTotal: quotation.grandTotal,
      amountPaid: 10000,
      balanceDue: Number((quotation.grandTotal - 10000).toFixed(2)),
      notes: "Partial payment received. Follow-up required.",
      paymentInstructions: "Kindly clear pending amount immediately.",
      bankDetails: "HDFC Bank - A/C 1234567890 - IFSC HDFC0001234",
      createdAt: "2026-04-09T15:40:00.000Z",
      updatedAt: "2026-04-17T10:05:00.000Z",
    };
  })(),
  (() => {
    const customer = DEMO_CUSTOMERS[3];
    const items = [
      createDemoItem("demo-i4-item-1", "Display Carton", "Offset printed display carton", 1000, "pcs", 7.5, 12),
      createDemoItem("demo-i4-item-2", "Printing Plate Charges", "One-time plate development", 1, "job", 2500, 18),
    ];
    const totals = calculateDemoTotals(items, 300, 500);

    return {
      id: "demo-invoice-4",
      invoiceNumber: "VPS-I-0004",
      invoiceDate: "2026-04-11",
      dueDate: "2026-04-26",
      quotationId: null,
      customerId: customer.id,
      customerSnapshot: createCustomerSnapshotFromCustomer(customer),
      status: "draft",
      items,
      ...totals,
      amountPaid: 0,
      balanceDue: totals.grandTotal,
      notes: "Sample billing draft for approval before dispatch.",
      paymentInstructions: "Payment due within 15 days from invoice date.",
      bankDetails: "HDFC Bank - A/C 1234567890 - IFSC HDFC0001234",
      createdAt: "2026-04-11T18:00:00.000Z",
      updatedAt: "2026-04-11T18:00:00.000Z",
    };
  })(),
];

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

const isSheetsEnabled = () => Boolean(SHEETS_ENDPOINT);

type SheetsEntity = keyof typeof SHEET_NAMES;

type SheetsRequestPayload = {
  action: "getAll" | "upsert" | "delete";
  entity: (typeof SHEET_NAMES)[SheetsEntity];
  indexNo?: string;
  data?: string;
  token?: string;
};

type SheetsRow = {
  indexNo: string;
  data: string;
};

type SheetsResponse = {
  success: boolean;
  rows?: SheetsRow[];
  message?: string;
};

const sendSheetsRequest = async (payload: SheetsRequestPayload): Promise<SheetsResponse | null> => {
  if (!SHEETS_ENDPOINT) {
    return null;
  }

  try {
    const response = await fetch(SHEETS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        ...payload,
        token: SHEETS_TOKEN,
      }),
    });

    const text = await response.text();
    if (!text) {
      return null;
    }

    return JSON.parse(text) as SheetsResponse;
  } catch {
    return null;
  }
};

const getAllFromSheets = async <T,>(entity: SheetsEntity): Promise<T[] | null> => {
  const result = await sendSheetsRequest({
    action: "getAll",
    entity: SHEET_NAMES[entity],
  });

  if (!result?.success || !result.rows) {
    return null;
  }

  return result.rows
    .map((row) => {
      try {
        return JSON.parse(row.data) as T;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is T => entry !== null);
};

const upsertInSheets = async <T extends { id: string }>(entity: SheetsEntity, record: T) => {
  await sendSheetsRequest({
    action: "upsert",
    entity: SHEET_NAMES[entity],
    indexNo: record.id,
    data: JSON.stringify(record),
  });
};

const deleteFromSheets = async (entity: SheetsEntity, indexNo: string) => {
  await sendSheetsRequest({
    action: "delete",
    entity: SHEET_NAMES[entity],
    indexNo,
  });
};

const shouldSeedDemoDataInSheets = async () => {
  if (!isSheetsEnabled()) {
    return false;
  }

  const [customers, quotations, invoices] = await Promise.all([
    getAllFromSheets<Customer>("customers"),
    getAllFromSheets<Quotation>("quotations"),
    getAllFromSheets<Invoice>("invoices"),
  ]);

  if (!customers || !quotations || !invoices) {
    return false;
  }

  return customers.length === 0 && quotations.length === 0 && invoices.length === 0;
};

const seedRecordsInSheets = async <T extends { id: string }>(entity: SheetsEntity, records: T[]) => {
  await Promise.all(records.map((record) => upsertInSheets(entity, record)));
};

const seedAdminDemoDataInSheets = async (force = false) => {
  if (!isSheetsEnabled()) {
    return false;
  }

  if (!force) {
    const shouldSeed = await shouldSeedDemoDataInSheets();
    if (!shouldSeed) {
      return false;
    }
  }

  await Promise.all([
    seedRecordsInSheets("customers", DEMO_CUSTOMERS),
    seedRecordsInSheets("quotations", DEMO_QUOTATIONS),
    seedRecordsInSheets("invoices", DEMO_INVOICES),
  ]);

  return true;
};

const ensureAdminDemoDataInSheets = async () => {
  if (hasCheckedSheetDemoSeed || !isSheetsEnabled()) {
    return;
  }

  hasCheckedSheetDemoSeed = true;
  await seedAdminDemoDataInSheets(false);
};

const shouldSeedDemoData = () => {
  if (!isBrowser) {
    return false;
  }

  const customers = readStorage<Customer[]>(STORAGE_KEYS.customers, []);
  const quotations = readStorage<Quotation[]>(STORAGE_KEYS.quotations, []);
  const invoices = readStorage<Invoice[]>(STORAGE_KEYS.invoices, []);

  return customers.length === 0 && quotations.length === 0 && invoices.length === 0;
};

export const seedAdminDemoData = (force = false) => {
  if (!isBrowser) {
    return false;
  }

  if (!force && !shouldSeedDemoData()) {
    return false;
  }

  writeStorage(STORAGE_KEYS.customers, DEMO_CUSTOMERS);
  writeStorage(STORAGE_KEYS.quotations, DEMO_QUOTATIONS);
  writeStorage(STORAGE_KEYS.invoices, DEMO_INVOICES);
  window.localStorage.setItem(STORAGE_KEYS.demoSeedVersion, DEMO_SEED_VERSION);
  return true;
};

const ensureAdminDemoData = () => {
  if (!isBrowser || hasCheckedDemoSeed) {
    return;
  }

  hasCheckedDemoSeed = true;
  const seededVersion = window.localStorage.getItem(STORAGE_KEYS.demoSeedVersion);

  if (seededVersion === DEMO_SEED_VERSION) {
    return;
  }

  seedAdminDemoData(false);
};

export const createRecordId = () => uuidv4();

export const getCustomers = async () => {
  ensureAdminDemoData();

  if (isSheetsEnabled()) {
    await ensureAdminDemoDataInSheets();
    const customersFromSheets = await getAllFromSheets<Customer>("customers");
    if (customersFromSheets) {
      saveCustomers(customersFromSheets);
      return customersFromSheets;
    }
  }

  return readStorage<Customer[]>(STORAGE_KEYS.customers, []);
};

export const saveCustomers = (customers: Customer[]) => {
  writeStorage(STORAGE_KEYS.customers, customers);
};

export const upsertCustomer = async (customer: Customer) => {
  const customers = await getCustomers();
  const existingIndex = customers.findIndex((entry) => entry.id === customer.id);

  if (existingIndex >= 0) {
    customers[existingIndex] = customer;
  } else {
    customers.unshift(customer);
  }

  saveCustomers(customers);

  if (isSheetsEnabled()) {
    await upsertInSheets("customers", customer);
  }

  return customer;
};

export const deleteCustomer = async (customerId: string) => {
  const customers = (await getCustomers()).filter((customer) => customer.id !== customerId);
  saveCustomers(customers);

  if (isSheetsEnabled()) {
    await deleteFromSheets("customers", customerId);
  }
};

export const getCustomerById = async (customerId: string) => {
  return (await getCustomers()).find((customer) => customer.id === customerId) ?? null;
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

export const getQuotations = async () => {
  ensureAdminDemoData();

  if (isSheetsEnabled()) {
    await ensureAdminDemoDataInSheets();
    const quotationsFromSheets = await getAllFromSheets<Quotation>("quotations");
    if (quotationsFromSheets) {
      saveQuotations(quotationsFromSheets);
      return quotationsFromSheets;
    }
  }

  return readStorage<Quotation[]>(STORAGE_KEYS.quotations, []);
};

export const saveQuotations = (quotations: Quotation[]) => {
  writeStorage(STORAGE_KEYS.quotations, quotations);
};

export const upsertQuotation = async (quotation: Quotation) => {
  const quotations = await getQuotations();
  const existingIndex = quotations.findIndex((entry) => entry.id === quotation.id);

  if (existingIndex >= 0) {
    quotations[existingIndex] = quotation;
  } else {
    quotations.unshift(quotation);
  }

  saveQuotations(quotations);

  if (isSheetsEnabled()) {
    await upsertInSheets("quotations", quotation);
  }

  return quotation;
};

export const deleteQuotation = async (quotationId: string) => {
  const quotations = (await getQuotations()).filter((quotation) => quotation.id !== quotationId);
  saveQuotations(quotations);

  if (isSheetsEnabled()) {
    await deleteFromSheets("quotations", quotationId);
  }
};

export const getQuotationById = async (quotationId: string) => {
  return (await getQuotations()).find((quotation) => quotation.id === quotationId) ?? null;
};

export const getInvoices = async () => {
  ensureAdminDemoData();

  if (isSheetsEnabled()) {
    await ensureAdminDemoDataInSheets();
    const invoicesFromSheets = await getAllFromSheets<Invoice>("invoices");
    if (invoicesFromSheets) {
      saveInvoices(invoicesFromSheets);
      return invoicesFromSheets;
    }
  }

  return readStorage<Invoice[]>(STORAGE_KEYS.invoices, []);
};

export const saveInvoices = (invoices: Invoice[]) => {
  writeStorage(STORAGE_KEYS.invoices, invoices);
};

export const upsertInvoice = async (invoice: Invoice) => {
  const invoices = await getInvoices();
  const existingIndex = invoices.findIndex((entry) => entry.id === invoice.id);

  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.unshift(invoice);
  }

  saveInvoices(invoices);

  if (isSheetsEnabled()) {
    await upsertInSheets("invoices", invoice);
  }

  return invoice;
};

export const deleteInvoice = async (invoiceId: string) => {
  const invoices = (await getInvoices()).filter((invoice) => invoice.id !== invoiceId);
  saveInvoices(invoices);

  if (isSheetsEnabled()) {
    await deleteFromSheets("invoices", invoiceId);
  }
};

export const getInvoiceById = async (invoiceId: string) => {
  return (await getInvoices()).find((invoice) => invoice.id === invoiceId) ?? null;
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

export const getNextQuotationNumber = async () => {
  const settings = getDocumentSettings();
  const quotationNumbers = (await getQuotations()).map((quotation) => quotation.quotationNumber);
  return generateNextDocumentNumber(settings.quotationPrefix, quotationNumbers);
};

export const getNextInvoiceNumber = async () => {
  const settings = getDocumentSettings();
  const invoiceNumbers = (await getInvoices()).map((invoice) => invoice.invoiceNumber);
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