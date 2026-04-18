import { useEffect, useMemo, useState } from "react";
import { Building2, PencilLine, Plus, Search, Trash2, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ADMIN_ROUTES } from "@/config/adminAuth";
import { deleteCustomer, getCustomers } from "@/lib/admin-storage";
import { Customer } from "@/types/admin-crm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminCustomers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCustomers(getCustomers());
  }, [location.key]);

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.companyName,
        customer.contactPerson,
        customer.email,
        customer.phone,
        customer.city,
        customer.state,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [customers, searchTerm]);

  const activeCities = useMemo(() => {
    return new Set(customers.map((customer) => customer.city).filter(Boolean)).size;
  }, [customers]);

  const handleDelete = (customerId: string) => {
    deleteCustomer(customerId);
    setCustomers(getCustomers());
    toast.success("Customer removed");
  };

  const openInPopup = (path: string) => {
    navigate(path, { state: { backgroundLocation: location } });
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                Customer workspace
              </Badge>
              <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">Manage customers</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-slate-500">
                Store company contacts once and reuse them while creating quotations and invoices. This keeps the sales
                workflow faster and more reliable as inquiries increase.
              </CardDescription>
            </div>

            <Button
              onClick={() => openInPopup(ADMIN_ROUTES.customersNew)}
              className="h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add customer
            </Button>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Customers</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{customers.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Cities</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{activeCities}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Results</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{filteredCustomers.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-slate-900">Customer directory</CardTitle>
            <CardDescription>Search, edit, and manage saved business contacts.</CardDescription>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by company, person, email, phone..."
              className="h-11 rounded-xl border-slate-200 bg-white pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-700 shadow-sm">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {customers.length === 0 ? "No customers saved yet" : "No customers match your search"}
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {customers.length === 0
                  ? "Create your first customer profile to speed up quotation and invoice generation."
                  : "Try a different company name, contact person, city, or phone number."}
              </p>
              {customers.length === 0 && (
                <Button
                  onClick={() => openInPopup(ADMIN_ROUTES.customersNew)}
                  className="mt-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add first customer
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-base font-semibold text-slate-900">{customer.companyName}</p>
                    <p className="mt-1 text-sm text-slate-600">{customer.contactPerson || "No contact person"}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <p>Email: {customer.email || "—"}</p>
                      <p>Phone: {customer.phone || "—"}</p>
                      <p>City: {customer.city || "—"}</p>
                      <p>State: {customer.state || "—"}</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInPopup(`/admin/customers/${customer.id}/edit`)}
                        className="flex-1 rounded-lg border-slate-200"
                      >
                        <PencilLine className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(customer.id)}
                        className="flex-1 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead>Company</TableHead>
                      <TableHead>Contact person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium text-slate-900">{customer.companyName}</TableCell>
                        <TableCell>{customer.contactPerson || "—"}</TableCell>
                        <TableCell className="max-w-52 truncate">{customer.email || "—"}</TableCell>
                        <TableCell>{customer.phone || "—"}</TableCell>
                        <TableCell>{customer.city || "—"}</TableCell>
                        <TableCell>{customer.state || "—"}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInPopup(`/admin/customers/${customer.id}/edit`)}
                              className="rounded-lg border-slate-200"
                            >
                              <PencilLine className="mr-1 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
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

export default AdminCustomers;