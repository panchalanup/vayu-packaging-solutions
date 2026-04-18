import { FileSpreadsheet, FileText, LayoutDashboard, LogOut, Users } from "lucide-react";
import adminLogo from "@/assets/black-vps-logo.png";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { ADMIN_ROUTES } from "@/config/adminAuth";
import { getAuthenticatedAdminEmail, logoutAdmin } from "@/lib/admin-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    href: ADMIN_ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    href: ADMIN_ROUTES.customers,
    icon: Users,
  },
  {
    title: "Quotations",
    href: ADMIN_ROUTES.quotations,
    icon: FileText,
  },
  {
    title: "Invoices",
    href: ADMIN_ROUTES.invoices,
    icon: FileSpreadsheet,
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const adminEmail = getAuthenticatedAdminEmail();

  const handleLogout = () => {
    logoutAdmin();
    navigate(ADMIN_ROUTES.login, { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white text-slate-700">
      <SidebarHeader className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="space-y-4 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img src={adminLogo} alt="Vayu Packaging Solutions" className="h-full w-full object-contain p-1.5" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold text-slate-900">Vayu Admin</p>
              <p className="truncate text-xs text-slate-500">Packaging Solutions</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-sky-700">Logged in</p>
            <p className="mt-1 truncate text-sm text-slate-600">{adminEmail || "Authorized admin"}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-4">
          <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    tooltip={item.title}
                    className="rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[active=true]:bg-slate-900 data-[active=true]:text-white"
                  >
                    <NavLink to={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 bg-white p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={handleLogout}
              className="rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default AdminSidebar;