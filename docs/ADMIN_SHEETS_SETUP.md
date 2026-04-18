# Admin CRM Google Sheets Setup (Customers / Quotations / Invoices)

This setup stores Admin CRM data in Google Sheets using 2 columns only:

- **A = IndexNo**
- **B = Data** (full JSON string)

Tabs required in your sheet:
- `Customers`
- `Quotations`
- `Invoices`

---

## 1) Deploy Apps Script

1. Open your Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Paste code from: `GOOGLE_APPS_SCRIPT_ADMIN_CRM.js`.
4. In script, set token value:
   - `const SHARED_TOKEN = "CHANGE_ME_ADMIN_TOKEN";`
5. Deploy:
   - **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy deployment URL.

---

## 2) Add frontend env variables

Create/update `.env` file in project root:

```env
VITE_ADMIN_CRM_SHEETS_ENDPOINT=https://script.google.com/macros/s/XXXX/exec
VITE_ADMIN_CRM_SHEETS_TOKEN=CHANGE_ME_ADMIN_TOKEN
```

> Token must match `SHARED_TOKEN` in Apps Script.

---

## 3) Run app

```bash
npm run dev
```

Now admin customers/quotations/invoices read/write to Google Sheets.

---

## Notes

- If endpoint is missing, app automatically falls back to localStorage.
- API URL is visible in browser (as discussed) since there is no backend proxy.
- `Data` column stores entire record JSON, so future schema changes are easier.
