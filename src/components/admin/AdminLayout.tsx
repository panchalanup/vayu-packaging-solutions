import { Outlet, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getAuthenticatedAdminEmail } from "@/lib/admin-auth";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/customers": "Customers",
  "/admin/customers/new": "Add Customer",
  "/admin/quotations": "Quotations",
  "/admin/quotations/new": "Create Quotation",
  "/admin/invoices": "Invoices",
  "/admin/invoices/new": "Create Invoice",
};

const AdminLayout = () => {
  const location = useLocation();
  const adminEmail = getAuthenticatedAdminEmail();
  const pageTitle =
    pageTitles[location.pathname] ??
    (location.pathname.includes("/admin/customers/") ? "Edit Customer" : undefined) ??
    (location.pathname.includes("/admin/quotations/") ? "Edit Quotation" : undefined) ??
    (location.pathname.includes("/admin/invoices/") ? "Edit Invoice" : undefined) ??
    "Admin";

  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar />

      <SidebarInset className="bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900" />
              <div className="space-y-1">
                <p className="text-lg font-semibold tracking-tight text-slate-900">{pageTitle}</p>
                <p className="text-xs text-slate-500">Operations workspace for customers, quotations, invoices, and reporting</p>
              </div>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Badge variant="secondary" className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
                Daily overview
              </Badge>
              <Badge variant="secondary" className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                Secured
              </Badge>
              <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
                {adminEmail || "Admin session"}
              </div>
            </div>
          </div>
        </header>

        <div className="min-h-[calc(100svh-5rem)] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.06),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(241,245,249,1)_100%)] p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;