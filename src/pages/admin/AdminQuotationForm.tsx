import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import AdminPageLoader from "@/components/admin/AdminPageLoader";
import { ADMIN_ROUTES } from "@/config/adminAuth";
import {
  calculateDocumentTotals,
  calculateLineTotal,
  createCustomerSnapshot,
  createRecordId,
  getCustomerById,
  getCustomers,
  getNextQuotationNumber,
  getQuotationById,
  upsertQuotation,
} from "@/lib/admin-storage";
import { Customer, DocumentLineItem, QuotationStatus } from "@/types/admin-crm";
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

const quotationStatuses: QuotationStatus[] = ["draft", "sent", "approved", "rejected", "converted"];

const AdminQuotationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [quotationNumber, setQuotationNumber] = useState("");
  const [quotationDate, setQuotationDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [status, setStatus] = useState<QuotationStatus>("draft");
  const [inquiryReference, setInquiryReference] = useState("");
  const [items, setItems] = useState<DocumentLineItem[]>([createEmptyLineItem()]);
  const [discount, setDiscount] = useState("0");
  const [shippingCharges, setShippingCharges] = useState("0");
  const [notes, setNotes] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [preparedBy, setPreparedBy] = useState("Admin");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadQuotationForm = async () => {
      setIsInitializing(true);

      try {
        const savedCustomers = await getCustomers();
        setCustomers(savedCustomers);

        if (!id) {
          setQuotationNumber(await getNextQuotationNumber());
          setQuotationDate(new Date().toISOString().slice(0, 10));
          return;
        }

        const quotation = await getQuotationById(id);

        if (!quotation) {
          toast.error("Quotation not found");
          navigate(ADMIN_ROUTES.quotations, { replace: true });
          return;
        }

        setSelectedCustomerId(quotation.customerId);
        setQuotationNumber(quotation.quotationNumber);
        setQuotationDate(quotation.quotationDate);
        setValidUntil(quotation.validUntil);
        setStatus(quotation.status);
        setInquiryReference(quotation.inquiryReference);
        setItems(quotation.items.length > 0 ? quotation.items : [createEmptyLineItem()]);
        setDiscount(String(quotation.discount));
        setShippingCharges(String(quotation.shippingCharges));
        setNotes(quotation.notes);
        setTermsAndConditions(quotation.termsAndConditions);
        setPaymentTerms(quotation.paymentTerms);
        setPreparedBy(quotation.preparedBy);
      } finally {
        setIsInitializing(false);
      }
    };

    void loadQuotationForm();
  }, [id, navigate]);

  const selectedCustomer = useMemo(() => {
    return customers.find((customer) => customer.id === selectedCustomerId) ?? null;
  }, [customers, selectedCustomerId]);

  const parsedDiscount = Number(discount) || 0;
  const parsedShippingCharges = Number(shippingCharges) || 0;

  const totals = useMemo(() => {
    return calculateDocumentTotals(items, parsedDiscount, parsedShippingCharges);
  }, [items, parsedDiscount, parsedShippingCharges]);

  const updateLineItem = (
    itemId: string,
    field: keyof DocumentLineItem,
    value: string | number,
  ) => {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }

    setIsSaving(true);

    try {
      const existingQuotation = id ? await getQuotationById(id) : null;
      const timestamp = new Date().toISOString();

      await upsertQuotation({
        id: existingQuotation?.id ?? createRecordId(),
        quotationNumber: quotationNumber || (await getNextQuotationNumber()),
        quotationDate,
        validUntil,
        customerId: selectedCustomer.id,
        customerSnapshot: createCustomerSnapshot(selectedCustomer),
        inquiryReference,
        status,
        items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        taxTotal: totals.taxTotal,
        shippingCharges: totals.shippingCharges,
        grandTotal: totals.grandTotal,
        notes,
        termsAndConditions,
        paymentTerms,
        preparedBy,
        createdAt: existingQuotation?.createdAt ?? timestamp,
        updatedAt: timestamp,
      });

      toast.success(isEditMode ? "Quotation updated" : "Quotation created");
      navigate(ADMIN_ROUTES.quotations, { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  if (isInitializing) {
    return <AdminPageLoader title="Loading quotation form..." description="Preparing quotation details from Google Sheets." />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.75fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit rounded-full border border-violet-200 bg-violet-50 text-violet-700">
              Quotation form
            </Badge>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                {isEditMode ? "Edit quotation" : "Create quotation"}
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-slate-500">
                Build a professional quotation quickly using saved customers, dynamic line items, and live totals.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm font-semibold text-slate-900">Quotation summary</p>
            <div className="grid gap-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Quotation number</span>
                <span className="font-medium text-slate-900">{quotationNumber || "Auto-generated"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total items</span>
                <span className="font-medium text-slate-900">{items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Grand total</span>
                <span className="font-semibold text-slate-900">₹{totals.grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ADMIN_ROUTES.quotations)}
              className="w-full rounded-xl border-slate-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to quotations
            </Button>
          </CardContent>
        </Card>
      </section>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Quotation details</CardTitle>
            <CardDescription>Select customer and document details.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
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
              <Label htmlFor="quotationNumber">Quotation number</Label>
              <Input
                id="quotationNumber"
                value={quotationNumber}
                onChange={(event) => setQuotationNumber(event.target.value)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as QuotationStatus)}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quotationStatuses.map((statusOption) => (
                    <SelectItem key={statusOption} value={statusOption}>
                      {statusOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quotationDate">Quotation date</Label>
              <Input
                id="quotationDate"
                type="date"
                value={quotationDate}
                onChange={(event) => setQuotationDate(event.target.value)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid until</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(event) => setValidUntil(event.target.value)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2 xl:col-span-2">
              <Label htmlFor="inquiryReference">Inquiry reference</Label>
              <Input
                id="inquiryReference"
                value={inquiryReference}
                onChange={(event) => setInquiryReference(event.target.value)}
                placeholder="Inquiry source, lead ID, or customer reference"
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparedBy">Prepared by</Label>
              <Input
                id="preparedBy"
                value={preparedBy}
                onChange={(event) => setPreparedBy(event.target.value)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">Line items</CardTitle>
              <CardDescription>Add products, quantities, pricing, and tax details.</CardDescription>
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
                      placeholder="Corrugated box"
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>

                  <div className="space-y-2 xl:col-span-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(event) => updateLineItem(item.id, "description", event.target.value)}
                      placeholder="Size, material, print details"
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
              <CardTitle className="text-lg font-semibold text-slate-900">Notes and terms</CardTitle>
              <CardDescription>Add business context for the customer-facing document.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="min-h-28 rounded-2xl border-slate-200"
                  placeholder="Add delivery notes, commercial highlights, or follow-up points"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="termsAndConditions">Terms and conditions</Label>
                <Textarea
                  id="termsAndConditions"
                  value={termsAndConditions}
                  onChange={(event) => setTermsAndConditions(event.target.value)}
                  className="min-h-28 rounded-2xl border-slate-200"
                  placeholder="Add quotation terms and conditions"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment terms</Label>
                <Textarea
                  id="paymentTerms"
                  value={paymentTerms}
                  onChange={(event) => setPaymentTerms(event.target.value)}
                  className="min-h-24 rounded-2xl border-slate-200"
                  placeholder="Advance %, dispatch terms, payment timeline"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Totals</CardTitle>
              <CardDescription>Live calculation based on current line items.</CardDescription>
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
                    <span className="text-slate-500">Discount</span>
                    <span className="font-medium text-slate-900">₹{totals.discount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Shipping</span>
                    <span className="font-medium text-slate-900">
                      ₹{totals.shippingCharges.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-600">Grand total</span>
                      <span className="text-xl font-semibold text-slate-950">
                        ₹{totals.grandTotal.toLocaleString("en-IN")}
                      </span>
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
                {isSaving ? "Saving..." : isEditMode ? "Save quotation" : "Create quotation"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AdminQuotationForm;