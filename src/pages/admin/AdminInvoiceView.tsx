import { useMemo } from "react";
import { ArrowLeft, Download, PencilLine } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import AdminDocumentPreview from "@/components/admin/AdminDocumentPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ADMIN_ROUTES } from "@/config/adminAuth";
import { exportElementAsImage, exportElementAsPdf } from "@/lib/admin-document-export";
import { getDocumentSettings, getInvoiceById } from "@/lib/admin-storage";

const AdminInvoiceView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const invoice = useMemo(() => (id ? getInvoiceById(id) : null), [id]);
  const settings = useMemo(() => getDocumentSettings(), []);

  const openInPopup = (path: string) => {
    navigate(path, { state: { backgroundLocation: location.state?.backgroundLocation ?? location } });
  };

  if (!invoice) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="space-y-4 p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">Invoice not found</p>
          <p className="text-sm text-slate-500">The requested invoice could not be loaded from local storage.</p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(ADMIN_ROUTES.invoices)}
              className="rounded-xl border-slate-200"
            >
              Back to invoices
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleExportPdf = async () => {
    try {
      await exportElementAsPdf("admin-invoice-preview", invoice.invoiceNumber);
      toast.success("Invoice PDF downloaded");
    } catch {
      toast.error("Unable to export invoice PDF");
    }
  };

  const handleExportImage = async () => {
    try {
      await exportElementAsImage("admin-invoice-preview", invoice.invoiceNumber);
      toast.success("Invoice image downloaded");
    } catch {
      toast.error("Unable to export invoice image");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-semibold tracking-tight text-slate-900">{invoice.invoiceNumber}</p>
            <p className="text-sm text-slate-500">
              Professional invoice preview for {invoice.customerSnapshot.companyName || "selected customer"}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(ADMIN_ROUTES.invoices)}
              className="rounded-xl border-slate-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => openInPopup(`/admin/invoices/${invoice.id}/edit`)}
              className="rounded-xl border-slate-200"
            >
              <PencilLine className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleExportImage}
              className="rounded-xl border-slate-200"
            >
              <Download className="mr-2 h-4 w-4" />
              Download image
            </Button>
            <Button onClick={handleExportPdf} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <AdminDocumentPreview type="invoice" document={invoice} settings={settings} />
    </div>
  );
};

export default AdminInvoiceView;