import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate, type Location as RouterLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { ANALYTICS_CONFIG } from "@/config/analytics";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import CompareQuote from "./pages/CompareQuote";
import BoxDesigner from "./pages/BoxDesigner";
import NotFound from "./pages/NotFound";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import AdminLayout from "@/components/admin/AdminLayout";
import { ADMIN_ROUTES } from "@/config/adminAuth";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCustomerForm from "./pages/admin/AdminCustomerForm";
import AdminQuotations from "./pages/admin/AdminQuotations";
import AdminQuotationForm from "./pages/admin/AdminQuotationForm";
import AdminQuotationView from "./pages/admin/AdminQuotationView";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminInvoiceForm from "./pages/admin/AdminInvoiceForm";
import AdminInvoiceView from "./pages/admin/AdminInvoiceView";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AdminEntityOverlay = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const closeOverlay = () => {
    navigate(-1);
  };

  if (isMobile) {
    return (
      <Drawer open onOpenChange={(open) => !open && closeOverlay()}>
        <DrawerContent className="max-h-[94dvh] overflow-y-auto">
          <div className="p-3 pb-6">
            <Outlet />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && closeOverlay()}>
      <DialogContent className="h-[94vh] max-h-[94vh] max-w-6xl overflow-y-auto p-0">
        <div className="min-h-full p-6">
          <Outlet />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: RouterLocation } | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={backgroundLocation || location} key={(backgroundLocation || location).pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/compare-quote" element={<CompareQuote />} />
          <Route path="/box-designer" element={<BoxDesigner />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path={ADMIN_ROUTES.login} element={<AdminLogin />} />
          <Route element={<AdminRouteGuard />}>
              <Route path={ADMIN_ROUTES.root} element={<AdminLayout />}>
                <Route index element={<Navigate to={ADMIN_ROUTES.dashboard} replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="customers/new" element={<AdminCustomerForm />} />
                <Route path="customers/:id/edit" element={<AdminCustomerForm />} />
                <Route path="quotations" element={<AdminQuotations />} />
                <Route path="quotations/new" element={<AdminQuotationForm />} />
                <Route path="quotations/:id/view" element={<AdminQuotationView />} />
                <Route path="quotations/:id/edit" element={<AdminQuotationForm />} />
                <Route path="invoices" element={<AdminInvoices />} />
                <Route path="invoices/new" element={<AdminInvoiceForm />} />
                <Route path="invoices/:id/view" element={<AdminInvoiceView />} />
                <Route path="invoices/:id/edit" element={<AdminInvoiceForm />} />
              </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {backgroundLocation && (
        <Routes>
          <Route element={<AdminRouteGuard />}>
            <Route path={ADMIN_ROUTES.root} element={<AdminEntityOverlay />}>
              <Route path="customers/new" element={<AdminCustomerForm />} />
              <Route path="customers/:id/edit" element={<AdminCustomerForm />} />
              <Route path="quotations/new" element={<AdminQuotationForm />} />
              <Route path="quotations/:id/view" element={<AdminQuotationView />} />
              <Route path="quotations/:id/edit" element={<AdminQuotationForm />} />
              <Route path="invoices/new" element={<AdminInvoiceForm />} />
              <Route path="invoices/:id/view" element={<AdminInvoiceView />} />
              <Route path="invoices/:id/edit" element={<AdminInvoiceForm />} />
            </Route>
          </Route>
        </Routes>
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnalyticsProvider enabled={ANALYTICS_CONFIG.ENABLED} debug={ANALYTICS_CONFIG.DEBUG}>
          <ScrollToTop />
          <AnimatedRoutes />
        </AnalyticsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
