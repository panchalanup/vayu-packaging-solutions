import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, FileSpreadsheet, PencilLine } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import AdminDocumentPreview from "@/components/admin/AdminDocumentPreview";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ADMIN_ROUTES } from "@/config/adminAuth";
import { exportElementAsImage, exportElementAsPdf } from "@/lib/admin-document-export";
import { getDocumentSettings, getQuotationById } from "@/lib/admin-storage";

const AdminQuotationView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [quotation, setQuotation] = useState<Awaited<ReturnType<typeof getQuotationById>>>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuotation = async () => {
      setIsLoading(true);

      try {
        if (!id) {
          setQuotation(null);
          return;
        }

        setQuotation(await getQuotationById(id));
      } finally {
        setIsLoading(false);
      }
    };

    void loadQuotation();
  }, [id]);

  const settings = useMemo(() => getDocumentSettings(), []);

  const openInPopup = (path: string) => {
    navigate(path, { state: { backgroundLocation: location.state?.backgroundLocation ?? location } });
  };

  if (isLoading) {
    return <AdminPageLoader title="Loading quotation..." description="Fetching quotation details from Google Sheets." />;
  }

  if (!quotation) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="space-y-4 p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">Quotation not found</p>
          <p className="text-sm text-slate-500">The requested quotation could not be loaded from local storage.</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate(ADMIN_ROUTES.quotations)} className="rounded-xl border-slate-200">
              Back to quotations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleExportPdf = async () => {
    try {
      await exportElementAsPdf("admin-quotation-preview", quotation.quotationNumber);
      toast.success("Quotation PDF downloaded");
    } catch {
      toast.error("Unable to export quotation PDF");
    }
  };

  const handleExportImage = async () => {
    try {
      await exportElementAsImage("admin-quotation-preview", quotation.quotationNumber);
      toast.success("Quotation image downloaded");
    } catch {
      toast.error("Unable to export quotation image");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-semibold tracking-tight text-slate-900">{quotation.quotationNumber}</p>
            <p className="text-sm text-slate-500">
              Professional quotation preview for {quotation.customerSnapshot.companyName || "selected customer"}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(ADMIN_ROUTES.quotations)}
              className="rounded-xl border-slate-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => openInPopup(`/admin/quotations/${quotation.id}/edit`)}
              className="rounded-xl border-slate-200"
            >
              <PencilLine className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => openInPopup(`${ADMIN_ROUTES.invoicesNew}?quotationId=${quotation.id}`)}
              className="rounded-xl border-slate-200"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Create invoice
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

      <AdminDocumentPreview type="quotation" document={quotation} settings={settings} />
    </div>
  );
};

export default AdminQuotationView;