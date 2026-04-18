import { useEffect, useMemo, useState } from "react";
import { Copy, FileText, PencilLine, Plus, ReceiptText, Search, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ADMIN_ROUTES } from "@/config/adminAuth";
import { createRecordId, deleteQuotation, getNextQuotationNumber, getQuotations, upsertQuotation } from "@/lib/admin-storage";
import { Quotation } from "@/types/admin-crm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusClasses: Record<string, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  sent: "border-sky-200 bg-sky-50 text-sky-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  converted: "border-violet-200 bg-violet-50 text-violet-700",
};

const AdminQuotations = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setQuotations(getQuotations());
  }, [location.key]);

  const filteredQuotations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return quotations;
    }

    return quotations.filter((quotation) =>
      [
        quotation.quotationNumber,
        quotation.customerSnapshot.companyName,
        quotation.customerSnapshot.contactPerson,
        quotation.status,
        quotation.inquiryReference,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [quotations, searchTerm]);

  const totalQuotationValue = useMemo(() => {
    return quotations.reduce((sum, quotation) => sum + quotation.grandTotal, 0);
  }, [quotations]);

  const approvedCount = useMemo(() => {
    return quotations.filter((quotation) => quotation.status === "approved").length;
  }, [quotations]);

  const handleDelete = (quotationId: string) => {
    deleteQuotation(quotationId);
    setQuotations(getQuotations());
    toast.success("Quotation removed");
  };

  const handleDuplicate = (quotation: Quotation) => {
    const timestamp = new Date().toISOString();

    upsertQuotation({
      ...quotation,
      id: createRecordId(),
      quotationNumber: getNextQuotationNumber(),
      status: "draft",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    setQuotations(getQuotations());
    toast.success("Quotation duplicated");
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
              <Badge variant="secondary" className="w-fit rounded-full border border-violet-200 bg-violet-50 text-violet-700">
                Quotation workspace
              </Badge>
              <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">Manage quotations</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-slate-500">
                Create, edit, duplicate, and track quotations for incoming inquiries. Use saved customers to speed up
                document preparation and follow-up.
              </CardDescription>
            </div>

            <Button
              onClick={() => openInPopup(ADMIN_ROUTES.quotationsNew)}
              className="h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              New quotation
            </Button>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Quotations</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{quotations.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Approved</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{approvedCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Value</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">₹{totalQuotationValue.toLocaleString("en-IN")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-slate-900">Quotation directory</CardTitle>
            <CardDescription>Search and manage quotation history.</CardDescription>
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
          {filteredQuotations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-700 shadow-sm">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {quotations.length === 0 ? "No quotations created yet" : "No quotations match your search"}
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {quotations.length === 0
                  ? "Start with your first quotation to handle inquiries faster and keep a clear record."
                  : "Try a different quotation number, company name, inquiry reference, or status."}
              </p>
              {quotations.length === 0 && (
                <Button
                  onClick={() => openInPopup(ADMIN_ROUTES.quotationsNew)}
                  className="mt-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create first quotation
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredQuotations.map((quotation) => (
                  <div key={quotation.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-base font-semibold text-slate-900">{quotation.quotationNumber}</p>
                      <Badge
                        variant="secondary"
                        className={`rounded-full border text-xs ${statusClasses[quotation.status] ?? statusClasses.draft}`}
                      >
                        {quotation.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{quotation.customerSnapshot.companyName || "—"}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <p>Date: {quotation.quotationDate || "—"}</p>
                      <p>Valid: {quotation.validUntil || "—"}</p>
                      <p className="col-span-2 font-medium text-slate-700">Total: ₹{quotation.grandTotal.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => openInPopup(`/admin/quotations/${quotation.id}/view`)} className="rounded-lg border-slate-200">View</Button>
                      <Button variant="outline" size="sm" onClick={() => openInPopup(`/admin/quotations/${quotation.id}/edit`)} className="rounded-lg border-slate-200"><PencilLine className="mr-1 h-3.5 w-3.5" />Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicate(quotation)} className="rounded-lg border-slate-200"><Copy className="mr-1 h-3.5 w-3.5" />Duplicate</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(quotation.id)} className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="mr-1 h-3.5 w-3.5" />Delete</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead>Quotation #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Valid until</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotations.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-medium text-slate-900">{quotation.quotationNumber}</TableCell>
                        <TableCell className="max-w-56 truncate">{quotation.customerSnapshot.companyName || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`rounded-full border ${statusClasses[quotation.status] ?? statusClasses.draft}`}
                          >
                            {quotation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{quotation.quotationDate || "—"}</TableCell>
                        <TableCell>{quotation.validUntil || "—"}</TableCell>
                        <TableCell className="font-medium">₹{quotation.grandTotal.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInPopup(`/admin/quotations/${quotation.id}/view`)}
                              className="rounded-lg border-slate-200"
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInPopup(`/admin/quotations/${quotation.id}/edit`)}
                              className="rounded-lg border-slate-200"
                            >
                              <PencilLine className="mr-1 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicate(quotation)}
                              className="rounded-lg border-slate-200"
                            >
                              <Copy className="mr-1 h-3.5 w-3.5" />
                              Duplicate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(quotation.id)}
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

export default AdminQuotations;