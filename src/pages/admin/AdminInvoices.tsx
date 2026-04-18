import { useEffect, useMemo, useState } from "react";
import { Copy, FileSpreadsheet, PencilLine, Plus, Search, Trash2, Wallet } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ADMIN_ROUTES } from "@/config/adminAuth";
import { createRecordId, deleteInvoice, getInvoices, getNextInvoiceNumber, upsertInvoice } from "@/lib/admin-storage";
import { Invoice } from "@/types/admin-crm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusClasses: Record<string, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  unpaid: "border-amber-200 bg-amber-50 text-amber-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  overdue: "border-red-200 bg-red-50 text-red-700",
  cancelled: "border-slate-200 bg-slate-100 text-slate-500",
};

const AdminInvoices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setInvoices(getInvoices());
  }, [location.key]);

  const filteredInvoices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return invoices;
    }

    return invoices.filter((invoice) =>
      [
        invoice.invoiceNumber,
        invoice.customerSnapshot.companyName,
        invoice.customerSnapshot.contactPerson,
        invoice.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [invoices, searchTerm]);

  const totalInvoiceValue = useMemo(() => {
    return invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
  }, [invoices]);

  const outstandingValue = useMemo(() => {
    return invoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0);
  }, [invoices]);

  const handleDelete = (invoiceId: string) => {
    deleteInvoice(invoiceId);
    setInvoices(getInvoices());
    toast.success("Invoice removed");
  };

  const handleDuplicate = (invoice: Invoice) => {
    const timestamp = new Date().toISOString();

    upsertInvoice({
      ...invoice,
      id: createRecordId(),
      invoiceNumber: getNextInvoiceNumber(),
      status: "draft",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    setInvoices(getInvoices());
    toast.success("Invoice duplicated");
  };

  const openInPopup = (path: string) => {
    navigate(path, { state: { backgroundLocation: location } });
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                Invoice workspace
              </Badge>
              <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">Manage invoices</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-slate-500">
                Track issued invoices, payment status, outstanding amounts, and duplicate existing records to speed up
                billing workflows.
              </CardDescription>
            </div>

            <Button
              onClick={() => openInPopup(ADMIN_ROUTES.invoicesNew)}
              className="h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              New invoice
            </Button>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Invoices</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{invoices.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Outstanding</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">₹{outstandingValue.toLocaleString("en-IN")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Value</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">₹{totalInvoiceValue.toLocaleString("en-IN")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-slate-900">Invoice directory</CardTitle>
            <CardDescription>Search and manage issued invoice records.</CardDescription>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by number, company, status..."
              className="h-11 rounded-xl border-slate-200 bg-white pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-700 shadow-sm">
                <FileSpreadsheet className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {invoices.length === 0 ? "No invoices created yet" : "No invoices match your search"}
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {invoices.length === 0
                  ? "Create your first invoice to manage payments and document issued billing."
                  : "Try a different invoice number, company name, or status."}
              </p>
              {invoices.length === 0 && (
                <Button
                  onClick={() => openInPopup(ADMIN_ROUTES.invoicesNew)}
                  className="mt-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create first invoice
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-base font-semibold text-slate-900">{invoice.invoiceNumber}</p>
                      <Badge variant="secondary" className={`rounded-full border text-xs ${statusClasses[invoice.status] ?? statusClasses.draft}`}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{invoice.customerSnapshot.companyName || "—"}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <p>Date: {invoice.invoiceDate || "—"}</p>
                      <p>Due: {invoice.dueDate || "—"}</p>
                      <p>Total: ₹{invoice.grandTotal.toLocaleString("en-IN")}</p>
                      <p>Balance: ₹{invoice.balanceDue.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => openInPopup(`/admin/invoices/${invoice.id}/view`)} className="rounded-lg border-slate-200">View</Button>
                      <Button variant="outline" size="sm" onClick={() => openInPopup(`/admin/invoices/${invoice.id}/edit`)} className="rounded-lg border-slate-200"><PencilLine className="mr-1 h-3.5 w-3.5" />Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicate(invoice)} className="rounded-lg border-slate-200"><Copy className="mr-1 h-3.5 w-3.5" />Duplicate</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(invoice.id)} className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="mr-1 h-3.5 w-3.5" />Delete</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due date</TableHead>
                      <TableHead>Grand total</TableHead>
                      <TableHead>Balance due</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium text-slate-900">{invoice.invoiceNumber}</TableCell>
                        <TableCell className="max-w-56 truncate">{invoice.customerSnapshot.companyName || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`rounded-full border ${statusClasses[invoice.status] ?? statusClasses.draft}`}
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{invoice.invoiceDate || "—"}</TableCell>
                        <TableCell>{invoice.dueDate || "—"}</TableCell>
                        <TableCell className="font-medium">₹{invoice.grandTotal.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="font-medium">₹{invoice.balanceDue.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInPopup(`/admin/invoices/${invoice.id}/view`)}
                              className="rounded-lg border-slate-200"
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInPopup(`/admin/invoices/${invoice.id}/edit`)}
                              className="rounded-lg border-slate-200"
                            >
                              <PencilLine className="mr-1 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicate(invoice)}
                              className="rounded-lg border-slate-200"
                            >
                              <Copy className="mr-1 h-3.5 w-3.5" />
                              Duplicate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(invoice.id)}
                              className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInvoices;