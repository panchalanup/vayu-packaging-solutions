import brandLogo from "@/assets/logo.png";
import signatorySignature from "@/assets/anups-sign.png";
import { DocumentLineItem, DocumentSettings, Invoice, Quotation } from "@/types/admin-crm";
import { Card, CardContent } from "@/components/ui/card";

type PreviewType = "quotation" | "invoice";

type AdminDocumentPreviewProps = {
  type: PreviewType;
  document: Quotation | Invoice;
  settings: DocumentSettings;
};

const formatCurrency = (value: number, currencySymbol: string) => {
  return `${currencySymbol}${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
};

const renderDocumentNumber = (type: PreviewType, document: Quotation | Invoice) => {
  if (type === "quotation") {
    return (document as Quotation).quotationNumber;
  }

  return (document as Invoice).invoiceNumber;
};

const renderIssueDate = (type: PreviewType, document: Quotation | Invoice) => {
  if (type === "quotation") {
    return (document as Quotation).quotationDate;
  }

  return (document as Invoice).invoiceDate;
};

const renderSecondaryDate = (type: PreviewType, document: Quotation | Invoice) => {
  if (type === "quotation") {
    return (document as Quotation).validUntil;
  }

  return (document as Invoice).dueDate;
};

const renderSecondaryLabel = (type: PreviewType) => {
  return type === "quotation" ? "Valid until" : "Due date";
};

const renderStatus = (document: Quotation | Invoice) => {
  return document.status.charAt(0).toUpperCase() + document.status.slice(1);
};

const renderNotes = (type: PreviewType, document: Quotation | Invoice) => {
  return type === "quotation" ? document.notes : document.notes;
};

const renderTermsBlock = (type: PreviewType, document: Quotation | Invoice, settings: DocumentSettings) => {
  if (type === "quotation") {
    const quotation = document as Quotation;
    return [
      {
        title: "Terms & conditions",
        value: quotation.termsAndConditions || "Standard terms and conditions will apply to the final order.",
      },
      {
        title: "Payment terms",
        value: quotation.paymentTerms || settings.paymentInstructions,
      },
    ];
  }

  const invoice = document as Invoice;
  return [
    {
      title: "Payment instructions",
      value: invoice.paymentInstructions || settings.paymentInstructions,
    },
    {
      title: "Bank details",
      value: invoice.bankDetails || settings.bankDetails || "Bank details will be shared upon confirmation.",
    },
  ];
};

const renderPaidSummary = (type: PreviewType, document: Quotation | Invoice, currencySymbol: string) => {
  if (type !== "invoice") {
    return null;
  }

  const invoice = document as Invoice;

  return (
    <>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Amount paid</span>
        <span className="font-medium text-slate-700">{formatCurrency(invoice.amountPaid, currencySymbol)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">Balance due</span>
        <span className="font-semibold text-slate-900">{formatCurrency(invoice.balanceDue, currencySymbol)}</span>
      </div>
    </>
  );
};

const ItemsTable = ({
  items,
  currencySymbol,
}: {
  items: DocumentLineItem[];
  currencySymbol: string;
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-50">
          <tr className="text-xs uppercase tracking-[0.16em] text-slate-400">
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">Qty</th>
            <th className="px-4 py-3 font-medium">Rate</th>
            <th className="px-4 py-3 font-medium">Tax</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                No line items added yet.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-t border-slate-200 align-top">
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-900">{item.name || "Untitled item"}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.description || "No description added."}</p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {item.quantity} {item.unit}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{formatCurrency(item.unitPrice, currencySymbol)}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{item.taxPercent}%</td>
                <td className="px-4 py-4 text-right text-sm font-medium text-slate-900">
                  {formatCurrency(item.lineTotal, currencySymbol)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const AdminDocumentPreview = ({ type, document, settings }: AdminDocumentPreviewProps) => {
  const isInvoice = type === "invoice";
  const customer = document.customerSnapshot;
  const documentNumber = renderDocumentNumber(type, document);
  const issueDate = renderIssueDate(type, document);
  const secondaryDate = renderSecondaryDate(type, document);
  const termsBlocks = renderTermsBlock(type, document, settings);
  const currencySymbol = settings.currencySymbol || "₹";
  const notes = renderNotes(type, document);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <div id={`admin-${type}-preview`} className="bg-white p-8 sm:p-10">
          <div className="space-y-8">
            <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <img src={brandLogo} alt={settings.companyName} className="h-full w-full object-contain p-2" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold tracking-tight text-slate-950">{settings.companyName}</p>
                    <p className="text-sm text-slate-500">{settings.companyEmail || "Business email not configured"}</p>
                    <p className="text-sm text-slate-500">{settings.companyPhone || "Business phone not configured"}</p>
                  </div>
                </div>

                <div className="max-w-lg text-sm leading-6 text-slate-500">
                  <p>{settings.companyAddress || "Business address will be configured in document settings."}</p>
                  {settings.companyGstNumber && <p className="mt-1">GST: {settings.companyGstNumber}</p>}
                </div>
              </div>

              <div className="min-w-[260px] rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {type === "quotation" ? "Quotation" : "Invoice"}
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{documentNumber}</p>

                <div className="mt-5 grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Issue date</span>
                    <span className="font-medium text-slate-900">{issueDate || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{renderSecondaryLabel(type)}</span>
                    <span className="font-medium text-slate-900">{secondaryDate || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className="font-medium text-slate-900">{renderStatus(document)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Bill to</p>
                <div className="mt-4 space-y-1.5">
                  <p className="text-lg font-semibold text-slate-900">{customer.companyName || "Customer company"}</p>
                  <p className="text-sm text-slate-600">{customer.contactPerson || "Primary contact not added"}</p>
                  <p className="text-sm text-slate-600">{customer.email || "No email added"}</p>
                  <p className="text-sm text-slate-600">{customer.phone || "No phone added"}</p>
                  <p className="pt-2 text-sm leading-6 text-slate-600">
                    {customer.billingAddress || "Billing address not added"}
                  </p>
                  {(customer.city || customer.state || customer.pincode) && (
                    <p className="text-sm text-slate-600">
                      {[customer.city, customer.state, customer.pincode].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {customer.gstNumber && <p className="text-sm text-slate-600">GST: {customer.gstNumber}</p>}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Summary</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-700">
                      {formatCurrency(document.subtotal, currencySymbol)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tax total</span>
                    <span className="font-medium text-slate-700">
                      {formatCurrency(document.taxTotal, currencySymbol)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-medium text-slate-700">
                      {formatCurrency(document.discount, currencySymbol)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Shipping</span>
                    <span className="font-medium text-slate-700">
                      {formatCurrency(document.shippingCharges, currencySymbol)}
                    </span>
                  </div>
                  {renderPaidSummary(type, document, currencySymbol)}
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Grand total</span>
                      <span className="text-xl font-semibold text-slate-950">
                        {formatCurrency(document.grandTotal, currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ItemsTable items={document.items} currencySymbol={currencySymbol} />

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 p-5 lg:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Notes</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {notes || "No additional notes have been added to this document."}
                </p>
              </div>

              <div className="grid gap-4 lg:col-span-2 lg:grid-cols-2">
                {termsBlocks.map((block) => (
                  <div key={block.title} className="rounded-3xl border border-slate-200 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{block.title}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{block.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex flex-col gap-4 text-sm text-slate-500 lg:flex-row lg:items-end lg:justify-between">
                <p>This document is generated from the internal admin workspace of {settings.companyName}.</p>
                <div className="text-right">
                  {isInvoice && (
                    <div className="mb-2 flex justify-end">
                      <img
                        src={signatorySignature}
                        alt="Authorised signatory signature"
                        className="h-14 w-auto max-w-[180px] object-contain sm:h-16 sm:max-w-[220px]"
                      />
                    </div>
                  )}
                  <p className="font-medium text-slate-700">
                    {type === "quotation" ? (document as Quotation).preparedBy || "Prepared by admin" : "Authorised Signatory"}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                    {type === "quotation" ? "Prepared by" : "Authorized by"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDocumentPreview;