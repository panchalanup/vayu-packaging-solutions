import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate, type Location as RouterLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { lazy, Suspense, useEffect } from "react";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { ANALYTICS_CONFIG } from "@/config/analytics";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Home";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import { ADMIN_ROUTES } from "@/config/adminAuth";

// Every route except Home is code-split so visitors only download what they open (admin + jsPDF included)
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Locations = lazy(() => import("./pages/Locations"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const IndustryDetail = lazy(() => import("./pages/IndustryDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const Quote = lazy(() => import("./pages/Quote"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const CompareQuote = lazy(() => import("./pages/CompareQuote"));
const BoxDesigner = lazy(() => import("./pages/BoxDesigner"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminCustomerForm = lazy(() => import("./pages/admin/AdminCustomerForm"));
const AdminQuotations = lazy(() => import("./pages/admin/AdminQuotations"));
const AdminQuotationForm = lazy(() => import("./pages/admin/AdminQuotationForm"));
const AdminQuotationView = lazy(() => import("./pages/admin/AdminQuotationView"));
const AdminInvoices = lazy(() => import("./pages/admin/AdminInvoices"));
const AdminInvoiceForm = lazy(() => import("./pages/admin/AdminInvoiceForm"));
const AdminInvoiceView = lazy(() => import("./pages/admin/AdminInvoiceView"));

const RouteFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
    <span aria-hidden="true" className="h-6 w-6 animate-spin rounded-full border-2 border-ink-900/15 border-t-green-600" />
  </div>
);

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
    <Suspense fallback={<RouteFallback />}>
        <Routes location={backgroundLocation || location}>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/industries/:slug" element={<IndustryDetail />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/privacy" element={<Privacy />} />
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
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MotionConfig reducedMotion="user">
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AnalyticsProvider enabled={ANALYTICS_CONFIG.ENABLED} debug={ANALYTICS_CONFIG.DEBUG}>
          <ScrollToTop />
          <AnimatedRoutes />
        </AnalyticsProvider>
      </BrowserRouter>
    </TooltipProvider>
    </MotionConfig>
  </QueryClientProvider>
);

export default App;
