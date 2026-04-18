import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { ADMIN_ROUTES } from "@/config/adminAuth";
import { createRecordId, getCustomerById, upsertCustomer } from "@/lib/admin-storage";
import { CustomerFormValues } from "@/types/admin-crm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyCustomerForm: CustomerFormValues = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  gstNumber: "",
  billingAddress: "",
  shippingAddress: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
};

const AdminCustomerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formValues, setFormValues] = useState<CustomerFormValues>(emptyCustomerForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    const customer = getCustomerById(id);

    if (!customer) {
      toast.error("Customer not found");
      navigate(ADMIN_ROUTES.customers, { replace: true });
      return;
    }

    setFormValues({
      companyName: customer.companyName,
      contactPerson: customer.contactPerson,
      email: customer.email,
      phone: customer.phone,
      gstNumber: customer.gstNumber,
      billingAddress: customer.billingAddress,
      shippingAddress: customer.shippingAddress,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      notes: customer.notes,
    });
  }, [id, navigate]);

  const pageTitle = useMemo(() => {
    return isEditMode ? "Edit customer" : "Add customer";
  }, [isEditMode]);

  const pageDescription = useMemo(() => {
    return isEditMode
      ? "Update saved customer details so quotations and invoices stay accurate."
      : "Create a reusable customer profile for faster quotation and invoice creation.";
  }, [isEditMode]);

  const updateField = (field: keyof CustomerFormValues, value: string) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const existingCustomer = id ? getCustomerById(id) : null;
      const timestamp = new Date().toISOString();

      upsertCustomer({
        id: existingCustomer?.id ?? createRecordId(),
        createdAt: existingCustomer?.createdAt ?? timestamp,
        updatedAt: timestamp,
        ...formValues,
      });

      toast.success(isEditMode ? "Customer updated" : "Customer created");
      navigate(ADMIN_ROUTES.customers, { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.75fr]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit rounded-full border border-sky-200 bg-sky-50 text-sky-700">
              Customer form
            </Badge>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">{pageTitle}</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-slate-500">
                {pageDescription}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Reusable business contact</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Saved customer information will be available while creating quotations and invoices.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ADMIN_ROUTES.customers)}
              className="rounded-xl border-slate-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to customers
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Customer details</CardTitle>
          <CardDescription>Enter the primary business and contact information below.</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  value={formValues.companyName}
                  onChange={(event) => updateField("companyName", event.target.value)}
                  placeholder="Vayu Packaging Solutions"
                  className="h-11 rounded-xl border-slate-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact person</Label>
                <Input
                  id="contactPerson"
                  value={formValues.contactPerson}
                  onChange={(event) => updateField("contactPerson", event.target.value)}
                  placeholder="Anup Panchal"
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formValues.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="customer@company.com"
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formValues.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="+91 98765 43210"
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST number</Label>
                <Input
                  id="gstNumber"
                  value={formValues.gstNumber}
                  onChange={(event) => updateField("gstNumber", event.target.value)}
                  placeholder="Enter GST number"
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formValues.pincode}
                  onChange={(event) => updateField("pincode", event.target.value)}
                  placeholder="380001"
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formValues.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  placeholder="Ahmedabad"
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formValues.state}
                  onChange={(event) => updateField("state", event.target.value)}
                  placeholder="Gujarat"
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing address</Label>
                <Textarea
                  id="billingAddress"
                  value={formValues.billingAddress}
                  onChange={(event) => updateField("billingAddress", event.target.value)}
                  placeholder="Enter billing address"
                  className="min-h-32 rounded-2xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingAddress">Shipping address</Label>
                <Textarea
                  id="shippingAddress"
                  value={formValues.shippingAddress}
                  onChange={(event) => updateField("shippingAddress", event.target.value)}
                  placeholder="Enter shipping address"
                  className="min-h-32 rounded-2xl border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal notes</Label>
              <Textarea
                id="notes"
                value={formValues.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Add any notes useful for future quotations and invoicing"
                className="min-h-28 rounded-2xl border-slate-200"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : isEditMode ? "Save changes" : "Create customer"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ADMIN_ROUTES.customers)}
                className="rounded-xl border-slate-200"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomerForm;