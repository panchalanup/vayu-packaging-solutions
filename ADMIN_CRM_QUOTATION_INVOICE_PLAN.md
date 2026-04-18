# Admin CRM, Quotation, and Invoice Module Plan

## Objective

Extend the current authenticated admin area into a lightweight internal operations workspace so inquiries can be handled faster.

Primary goals:

- add more admin sidebar sections:
  - Customers
  - Quotations
  - Invoices
- enable fast creation and editing of:
  - customer records
  - quotations
  - invoices
- support dynamic multi-line item entry
- allow quick sharing/download of quotations and invoices in:
  - PDF format
  - image format
- store all data in `localStorage` for now
- use `src/assets/logo.png` in professional document templates

---

## Business Goal

Inquiry volume is increasing, so the admin panel should help with:

- quickly creating customers from incoming leads
- generating quotations fast
- converting approved quotations into invoices
- editing documents without friction
- exporting trustworthy-looking business documents that can be shared immediately

This should behave like a lightweight frontend-only CRM and document generation tool until a backend is added later.

---

## Current State

### Existing admin setup
The project already includes:

- authenticated admin login
- protected `/admin` route structure
- admin layout shell
- admin sidebar
- dashboard page

### Existing admin route structure
Currently available:

- `/admin/login`
- `/admin`
- `/admin/dashboard`

### Existing admin sidebar
Currently includes only:

- Dashboard

---

## Proposed New Admin Navigation

Add these sidebar tabs:

- Dashboard
- Customers
- Quotations
- Invoices

### Proposed admin route structure

- `/admin/dashboard`
- `/admin/customers`
- `/admin/customers/new`
- `/admin/customers/:id/edit`
- `/admin/quotations`
- `/admin/quotations/new`
- `/admin/quotations/:id/edit`
- `/admin/quotations/:id/view`
- `/admin/invoices`
- `/admin/invoices/new`
- `/admin/invoices/:id/edit`
- `/admin/invoices/:id/view`

Optional later:

- `/admin/quotations/:id/duplicate`
- `/admin/invoices/:id/duplicate`

---

## Module 1: Customers

## Purpose
Store reusable customer information so quotation and invoice creation becomes faster.

## Customer fields

- `id`
- `companyName`
- `contactPerson`
- `email`
- `phone`
- `gstNumber`
- `billingAddress`
- `shippingAddress`
- `city`
- `state`
- `pincode`
- `notes`
- `createdAt`
- `updatedAt`

## Customer features

- create customer
- edit customer
- delete customer
- search customers
- filter customers
- select customer while creating quotation/invoice
- auto-fill customer details in document forms

## Customer page UI

- customer list/table
- search bar
- add customer button
- edit action
- delete action
- empty state for first-time use

---

## Module 2: Quotations

## Purpose
Generate professional quotations quickly from incoming inquiries.

## Quotation fields

- `id`
- `quotationNumber`
- `quotationDate`
- `validUntil`
- `customerId`
- `customerSnapshot`
- `inquiryReference`
- `status`
- `items`
- `subtotal`
- `discount`
- `taxTotal`
- `shippingCharges`
- `grandTotal`
- `notes`
- `termsAndConditions`
- `paymentTerms`
- `preparedBy`
- `createdAt`
- `updatedAt`

## Quotation status options

- `draft`
- `sent`
- `approved`
- `rejected`
- `converted`

## Quotation line item fields

Each quotation item should support:

- `id`
- `name`
- `description`
- `quantity`
- `unit`
- `unitPrice`
- `taxPercent`
- `lineTotal`

## Quotation features

- create quotation
- edit quotation
- delete quotation
- duplicate quotation
- preview quotation
- dynamic add/remove item rows
- live total calculations
- select existing customer
- mark status
- convert quotation to invoice
- export as PDF
- export as image
- maintain professional document look

## Quotation UX priorities

- fast entry for multiple items
- inline editing
- real-time calculations
- reusable customer information
- low-friction workflow
- polished preview before export

---

## Module 3: Invoices

## Purpose
Generate professional invoices from approved quotations or create them manually.

## Invoice fields

- `id`
- `invoiceNumber`
- `invoiceDate`
- `dueDate`
- `quotationId`
- `customerId`
- `customerSnapshot`
- `status`
- `items`
- `subtotal`
- `discount`
- `taxTotal`
- `shippingCharges`
- `grandTotal`
- `amountPaid`
- `balanceDue`
- `notes`
- `paymentInstructions`
- `bankDetails`
- `createdAt`
- `updatedAt`

## Invoice status options

- `draft`
- `unpaid`
- `paid`
- `overdue`
- `cancelled`

## Invoice features

- create invoice manually
- create invoice from quotation
- edit invoice
- delete invoice
- duplicate invoice
- manage payment status
- preview printable invoice
- export PDF
- export image
- maintain trusted business presentation

---

## Data Storage Strategy

## Storage approach
Use `localStorage` for all records for now.

## Proposed storage keys

- `admin_customers`
- `admin_quotations`
- `admin_invoices`
- `admin_document_settings`

## Storage rules

- store typed arrays of records
- use safe parsing helpers
- generate IDs locally
- generate sequential document numbers
- preserve timestamps
- keep customer snapshot inside quotations/invoices so document history remains stable even if customer data changes later

## Utility functions needed

- load records from storage
- save records to storage
- create record
- update record
- delete record
- find by ID
- generate next quotation number
- generate next invoice number
- convert quotation into invoice payload

---

## TypeScript Domain Models

Create shared types for consistency.

## Proposed types

- `Customer`
- `CustomerFormValues`
- `Quotation`
- `QuotationItem`
- `QuotationStatus`
- `Invoice`
- `InvoiceItem`
- `InvoiceStatus`
- `DocumentSettings`

This will make forms, local storage, previews, and export utilities easier to maintain.

---

## Document Template Design

## Branding
Use:

- `src/assets/logo.png`

## Design direction
Quotation and invoice designs should feel:

- professional
- trustworthy
- clean
- business-ready
- easy to share with customers

## Visual style
Use a layout with:

- white background
- clean header
- clear table structure
- subtle borders
- strong spacing
- modern typography
- balanced totals section
- clean footer

## Template structure

### Header
- logo
- company name/details
- document title
- quotation/invoice number
- issue date
- validity or due date

### Customer section
- company name
- contact person
- email
- phone
- address
- GST number

### Items table
- item
- description
- qty
- unit
- rate
- tax
- amount

### Summary section
- subtotal
- discount
- tax
- shipping
- grand total
- amount paid
- balance due

### Footer
- terms and conditions
- payment instructions
- bank details
- prepared by / authorized signatory

---

## Export and Sharing Plan

## Required export options

- download quotation/invoice as PDF
- download quotation/invoice as image

## Export strategy
The project already appears to include frontend document export tooling, so the implementation should use the existing client-side approach.

### PDF export
- render a clean printable document section
- export the rendered document as PDF

### Image export
- capture the document preview area
- export as PNG or JPG

## Sharing flow
The admin should be able to:

- preview document
- click download PDF
- click download image
- share downloaded file manually through WhatsApp, email, or other channels

Optional later:
- one-click share flows once backend/cloud storage is added

---

## UI and Page Plan

## Dashboard
Keep dashboard as the overview page and later add quick actions such as:

- create customer
- create quotation
- create invoice
- recent documents
- pending quotations
- unpaid invoices

## Customers page
- searchable customer list
- add customer CTA
- edit/delete actions
- reuse customers in document forms

## Quotations page
- quotation list
- status badges
- filters by status/customer/date
- create button
- edit/view/duplicate/export actions

## Invoices page
- invoice list
- payment status badges
- unpaid/overdue indicators
- create button
- edit/view/duplicate/export actions

---

## Editor Experience Plan

## Quotation and invoice forms should include

- customer selection at top
- dynamic line items section
- add item button
- remove item action
- live totals calculation
- notes section
- terms section
- preview area
- save draft action
- export actions

## UX focus
The workflow must be fast and easy for repeated daily use:

- minimal friction
- smart defaults
- clear totals
- quick edits
- professional preview
- fast export

---

## Suggested File Structure

## Config / types / utilities

- `src/types/admin-crm.ts`
- `src/lib/admin-storage.ts`
- `src/lib/document-numbering.ts`
- `src/lib/quotation-utils.ts`
- `src/lib/invoice-utils.ts`

## Components

- `src/components/admin/AdminDocumentPreview.tsx`
- `src/components/admin/AdminDocumentHeader.tsx`
- `src/components/admin/AdminLineItemsEditor.tsx`
- `src/components/admin/AdminTotalsCard.tsx`
- `src/components/admin/CustomerForm.tsx`
- `src/components/admin/QuotationForm.tsx`
- `src/components/admin/InvoiceForm.tsx`

## Pages

- `src/pages/admin/AdminCustomers.tsx`
- `src/pages/admin/AdminCustomerForm.tsx`
- `src/pages/admin/AdminQuotations.tsx`
- `src/pages/admin/AdminQuotationForm.tsx`
- `src/pages/admin/AdminQuotationView.tsx`
- `src/pages/admin/AdminInvoices.tsx`
- `src/pages/admin/AdminInvoiceForm.tsx`
- `src/pages/admin/AdminInvoiceView.tsx`

---

## Implementation Phases

## Phase 1: Base admin expansion
- add new sidebar tabs
- add new routes
- update admin page titles
- create shared types
- create localStorage helpers

## Phase 2: Customers module
- build customer list page
- build add/edit customer form
- implement localStorage CRUD
- add search/filter support

## Phase 3: Quotations module
- build quotation list page
- build quotation editor
- implement dynamic line items
- implement live totals
- implement save/edit/delete
- implement duplicate quotation

## Phase 4: Invoices module
- build invoice list page
- build invoice editor
- implement quotation-to-invoice conversion
- implement payment status handling
- implement save/edit/delete

## Phase 5: Document preview and export
- build branded quotation preview
- build branded invoice preview
- use `logo.png`
- implement PDF export
- implement image export

## Phase 6: UX polish
- improve form speed
- better empty states
- better search/filtering
- confirmation dialogs
- success/error toasts
- quick actions from dashboard

---

## Key Product Outcomes

After implementation, the admin should be able to:

- handle increasing inquiries more quickly
- save and reuse customers
- create quotations faster
- convert quotations into invoices easily
- edit documents anytime
- share professional documents immediately
- operate everything without backend support for now

---

## Recommended Future Enhancements

Later, when backend support is added, this module can be extended with:

- cloud database sync
- multi-user admin roles
- customer portals
- online document sharing links
- payment tracking
- inquiry-to-customer conversion
- analytics dashboard
- audit logs

---

## Final Recommendation

Build this as a **frontend-first admin operations tool** using:

- existing admin shell
- `localStorage`
- reusable TypeScript models
- professional printable templates
- `src/assets/logo.png`

This approach will immediately improve speed of quotation and invoice handling while staying simple to implement in the current project.