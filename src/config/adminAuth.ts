export const ADMIN_AUTH_CONFIG = {
  email: "panchalanup2572@gmail.com",
  passwordHash: "449443ef2b29b91d24909c365d3f0f8c24a093878b7cf5c92178a8f5e1004779",
  storageKey: "vps_admin_authenticated",
  emailStorageKey: "vps_admin_email",
} as const;

export const ADMIN_ROUTES = {
  login: "/admin/login",
  root: "/admin",
  dashboard: "/admin/dashboard",
  customers: "/admin/customers",
  customersNew: "/admin/customers/new",
  quotations: "/admin/quotations",
  quotationsNew: "/admin/quotations/new",
  invoices: "/admin/invoices",
  invoicesNew: "/admin/invoices/new",
} as const;
