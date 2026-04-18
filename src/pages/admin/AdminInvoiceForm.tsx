import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ADMIN_ROUTES } from "@/config/adminAuth";
import {
  calculateDocumentTotals,
  calculateLineTotal,
  createCustomerSnapshot,
  createRecordId,
  getCustomerById,
  getCustomers,
  getInvoiceById,
  getNextInvoiceNumber,
  getQuotationById,
  getQuotations,
  upsertInvoice,
} from "@/lib/admin-storage";
import { Customer, DocumentLineItem, InvoiceStatus, Quotation } from "@/types/admin-crm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const createEmptyLineItem = (): DocumentLineItem => ({
  id: createRecordId(),
  name: "",
  description: "",
  quantity: 1,
  unit: "pcs",
  unitPrice: 0,
  taxPercent: 18,
  lineTotal: 0,
});

const invoiceStatuses: InvoiceStatus[] = ["draft", "unpaid", "paid", "overdue", "cancelled"];

const AdminInvoiceForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedQuotationId, setSelectedQuotationId] = useState("manual");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [items, setItems] = useState<DocumentLineItem[]>([createEmptyLineItem()]);
  const [discount, setDiscount] = useState("0");
  const [shippingCharges, setShippingCharges] = useState("0");
  const [amountPaid, setAmountPaid] = useState("0");
  const [notes, setNotes] = useState("");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedCustomers = getCustomers();
    const savedQuotations = getQuotations();

    setCustomers(savedCustomers);
    setQuotations(savedQuotations);

    if (!id) {
      setInvoiceNumber(getNextInvoiceNumber());
      setInvoiceDate(new Date().toISOString().slice(0, 10));

      const quotationIdFromQuery = new URLSearchParams(location.search).get("quotationId");
      if (quotationIdFromQuery) {
        const linkedQuotation = getQuotationById(quotationIdFromQuery);

        if (linkedQuotation) {
          setSelectedQuotationId(linkedQuotation.id);
          setSelectedCustomerId(linkedQuotation.customerId);
          setItems(linkedQuotation.items);
          setDiscount(String(linkedQuotation.discount));
          setShippingCharges(String(linkedQuotation.shippingCharges));
          setNotes(linkedQuotation.notes);
          setPaymentInstructions(linkedQuotation.paymentTerms);
        }
      }

      return;
    }

    const invoice = getInvoiceById(id);

    if (!invoice) {
      toast.error("Invoice not found");
      navigate(ADMIN_ROUTES.invoices, { replace: true });
      return;
    }

    setSelectedCustomerId(invoice.customerId);
    setSelectedQuotationId(invoice.quotationId ?? "manual");
    setInvoiceNumber(invoice.invoiceNumber);
    setInvoiceDate(invoice.invoiceDate);
    setDueDate(invoice.dueDate);
    setStatus(invoice.status);
    setItems(invoice.items.length > 0 ? invoice.items : [createEmptyLineItem()]);
    setDiscount(String(invoice.discount));
    setShippingCharges(String(invoice.shippingCharges));
    setAmountPaid(String(invoice.amountPaid));
    setNotes(invoice.notes);
    setPaymentInstructions(invoice.paymentInstructions);
    setBankDetails(invoice.bankDetails);
  }, [id, location.search, navigate]);

  const selectedCustomer = useMemo(() => {
    return customers.find((customer) => customer.id === selectedCustomerId) ?? null;
  }, [customers, selectedCustomerId]);

  const parsedDiscount = Number(discount) || 0;
  const parsedShippingCharges = Number(shippingCharges) || 0;
  const parsedAmountPaid = Number(amountPaid) || 0;

  const totals = useMemo(() => {
    return calculateDocumentTotals(items, parsedDiscount, parsedShippingCharges);
  }, [items, parsedDiscount, parsedShippingCharges]);

  const balanceDue = useMemo(() => {
    return Number(Math.max(totals.grandTotal - parsedAmountPaid, 0).toFixed(2));
  }, [parsedAmountPaid, totals.grandTotal]);

  const applyQuotationToForm = (quotationId: string) => {
    if (quotationId === "manual") {
      setSelectedQuotationId("manual");
      return;
    }

    const quotation = getQuotationById(quotationId);

    if (!quotation) {
      toast.error("Selected quotation could not be loaded");
      return;
    }

    setSelectedQuotationId(quotationId);
    setSelectedCustomerId(quotation.customerId);
    setItems(quotation.items);
    setDiscount(String(quotation.discount));
    setShippingCharges(String(quotation.shippingCharges));
    setNotes(quotation.notes);
    setPaymentInstructions(quotation.paymentTerms);
  };

  const updateLineItem = (itemId: string, field: keyof DocumentLineItem, value: string | number) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const nextItem = {
          ...item,
          [field]:
            field === "quantity" || field === "unitPrice" || field === "taxPercent"
              ? Number(value) || 0
              : value,
        } as DocumentLineItem;

        return {
          ...nextItem,
          lineTotal: calculateLineTotal(nextItem),
        };
      }),
    );
  };

  const addLineItem = () => {
    setItems((current) => [...current, createEmptyLineItem()]);
  };

  const removeLineItem = (itemId: string) => {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((item) => item.id !== itemId);
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    setIsSaving(true);

    try {
      const existingInvoice = id ? getInvoiceById(id) : null;
      const timestamp = new Date().toISOString();

      upsertInvoice({
        id: existingInvoice?.id ?? createRecordId(),
        invoiceNumber: invoiceNumber || getNextInvoiceNumber(),
        invoiceDate,
        dueDate,
        quotationId: selectedQuotationId === "manual" ? null : selectedQuotationId,
        customerId: selectedCustomer.id,
        customerSnapshot: createCustomerSnapshot(selectedCustomer),
        status,
        items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        taxTotal: totals.taxTotal,
        shippingCharges: totals.shippingCharges,
        grandTotal: totals.grandTotal,
        amountPaid: parsedAmountPaid,
        balanceDue,
        notes,
        paymentInstructions,
        bankDetails,
        createdAt: existingInvoice?.createdAt ?? timestamp,
        updatedAt: timestamp,
      });

      toast.success(isEditMode ? "Invoice updated" : "Invoice created");
      navigate(ADMIN_ROUTES.invoices, { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.75fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
              Invoice form
            </Badge>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                {isEditMode ? "Edit invoice" : "Create invoice"}
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-slate-500">
                Create invoices from scratch or start from an existing quotation for faster billing.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm font-semibold text-slate-900">Invoice summary</p>
            <div className="grid gap-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Invoice number</span>
                <span className="font-medium text-slate-900">{invoiceNumber || "Auto-generated"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Grand total</span>
                <span className="font-semibold text-slate-900">₹{totals.grandTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Balance due</span>
                <span className="font-semibold text-slate-900">₹{balanceDue.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ADMIN_ROUTES.invoices)}
              className="w-full rounded-xl border-slate-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to invoices
            </Button>
          </CardContent>
        </Card>
      </section>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Invoice details</CardTitle>
            <CardDescription>Select a quotation or prepare a manual invoice.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 xl:col-span-2">
              <Label>Source quotation</Label>
              <Select value={selectedQuotationId} onValueChange={applyQuotationToForm}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue placeholder="Select quotation or use manual invoice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual invoice</SelectItem>
                  {quotations.map((quotation) => (
                    <SelectItem key={quotation.id} value={quotation.id}>
                      {quotation.quotationNumber} - {quotation.customerSnapshot.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 xl:col-span-2">
              <Label>Customer</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue placeholder="Select a saved customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(event) => setInvoiceNumber(event.target.value)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as InvoiceStatus)}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {invoiceStatuses.map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      {statusOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(event) => setInvoiceDate(event.target.value)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">Line items</CardTitle>
              <CardDescription>Add billing rows and item details.</CardDescription>
            </div>

            <Button type="button" onClick={addLineItem} variant="outline" className="rounded-xl border-slate-200">
              <Plus className="mr-2 h-4 w-4" />
              Add item
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="rounded-3xl border border-slate-200 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Item {index + 1}</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeLineItem(item.id)}
                    disabled={items.length === 1}
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-6">
                  <div className="space-y-2 xl:col-span-2">
                    <Label>Item name</Label>
                    <Input
                      value={item.name}
                      onChange={(event) => updateLineItem(item.id, "name", event.target.value)}
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>

                  <div className="space-y-2 xl:col-span-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(event) => updateLineItem(item.id, "description", event.target.value)}
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(event) => updateLineItem(item.id, "quantity", event.target.value)}
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      value={item.unit}
                      onChange={(event) => updateLineItem(item.id, "unit", event.target.value)}
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(event) => updateLineItem(item.id, "unitPrice", event.target.value)}
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tax %</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.taxPercent}
                      onChange={(event) => updateLineItem(item.id, "taxPercent", event.target.value)}
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Line total</Label>
                    <Input value={item.lineTotal} readOnly className="h-11 rounded-xl border-slate-200 bg-slate-50" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Notes and payment details</CardTitle>
              <CardDescription>Include payment instructions and billing notes for the customer.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="min-h-28 rounded-2xl border-slate-200"
                  placeholder="Add notes or billing context"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentInstructions">Payment instructions</Label>
                <Textarea
                  id="paymentInstructions"
                  value={paymentInstructions}
                  onChange={(event) => setPaymentInstructions(event.target.value)}
                  className="min-h-24 rounded-2xl border-slate-200"
                  placeholder="Payment timeline, terms, and remittance details"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankDetails">Bank details</Label>
                <Textarea
                  id="bankDetails"
                  value={bankDetails}
                  onChange={(event) => setBankDetails(event.target.value)}
                  className="min-h-24 rounded-2xl border-slate-200"
                  placeholder="Account name, bank, branch, IFSC, account number"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Totals</CardTitle>
              <CardDescription>Track totals and payment balance.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingCharges">Shipping charges</Label>
                <Input
                  id="shippingCharges"
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingCharges}
                  onChange={(event) => setShippingCharges(event.target.value)}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amountPaid">Amount paid</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountPaid}
                  onChange={(event) => setAmountPaid(event.target.value)}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-900">₹{totals.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tax total</span>
                    <span className="font-medium text-slate-900">₹{totals.taxTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Grand total</span>
                    <span className="font-medium text-slate-900">₹{totals.grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Amount paid</span>
                    <span className="font-medium text-slate-900">₹{parsedAmountPaid.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-600">Balance due</span>
                      <span className="text-xl font-semibold text-slate-950">₹{balanceDue.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : isEditMode ? "Save invoice" : "Create invoice"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AdminInvoiceForm;