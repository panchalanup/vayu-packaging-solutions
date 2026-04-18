# Admin Demo Data (Quick Guide)

This project can auto-add **4 demo Customers, 4 Quotations, and 4 Invoices** for testing.

## When demo data is added automatically
- Demo data is added only when all 3 are empty:
  - `admin_customers`
  - `admin_quotations`
  - `admin_invoices`

So it will **not overwrite** your existing real data.

## How to reset and re-add demo data (anytime)

1. Open your app in browser.
2. Press `F12` to open DevTools.
3. Go to **Application** tab (Chrome/Edge).
4. Open **Local Storage** → your site URL (example: `http://localhost:8084`).
5. Delete these keys:
   - `admin_customers`
   - `admin_quotations`
   - `admin_invoices`
   - `admin_demo_seed_version`
6. Refresh the page.

After refresh, demo data will be seeded again automatically.

## Quick verify
- Go to Admin → **Customers** (should show 4)
- Go to Admin → **Quotations** (should show 4)
- Go to Admin → **Invoices** (should show 4)
