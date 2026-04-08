# Project File Structure

```
dashboard/
├── README.md
├── FILE_STRUCTURE.md
├── package.json
├── package-lock.json
├── vite.config.js
├── .env                (local only, not committed)
├── .env.example        (sample env values)
├── supabase/
│   └── migrations/
│       └── 20260327_add_payments_hours_comment.sql
│       └── 20260407_deals_client_details_archive_clients.sql
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── Navigation.jsx
│   │   ├── DealsForm.jsx
│   │   ├── PaymentTracker.jsx
│   │   └── TableActions.jsx
│   ├── hooks/
│   │   ├── useConfirmDelete.js
│   │   └── useCrudForm.js
│   ├── services/
│   │   ├── supabase.js
│   │   └── dataService.js
│   ├── styles/
│   │   ├── base.css
│   │   ├── tables.css
│   │   └── panels.css
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── dist/ (generated)
└── node_modules/ (generated)
```

## Documentation
- README.md — full overview, setup, and usage
- FILE_STRUCTURE.md — this file

## Configuration
- package.json — React/Vite dependencies and npm scripts
- package-lock.json — npm lockfile for reproducible installs
- vite.config.js — Vite build config
- .env — local environment variables (not checked in)
- .env.example — sample values for onboarding (uses Supabase)
- Required env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

## Database Migrations
- supabase/migrations/20260327_add_payments_hours_comment.sql — adds payments.hours and payments.comment columns
- supabase/migrations/20260407_deals_client_details_archive_clients.sql — adds deal-level client detail columns, backfills from legacy clients, archives and drops clients table

## React Components
- Dashboard.jsx — metrics overview and data table fed by Supabase data
- ConfirmDialog.jsx — shared in-app confirmation modal for destructive actions
- Navigation.jsx — mobile-first sidebar/drawer navigation with hamburger controls
- DealsForm.jsx — create, update, and delete deals with embedded client business/contact details
- PaymentTracker.jsx — log payments with optional hours/comments and manage a unified payments log
- TableActions.jsx — reusable row action buttons (edit/delete) with loading/disabled states

## Hooks
- useConfirmDelete.js — shared delete confirmation workflow with async state handling
- useCrudForm.js — shared form state helper for CRUD pages (form state, edit mode, submit state)

## Services
- supabase.js — initializes the Supabase client from environment variables
- dataService.js — CRUD helpers for deals, `payments`, and legacy `hours` table compatibility

## Styling
- App.css — mobile-first app shell, banner, and drawer/sidebar navigation styling
- base.css — shared page layout, forms, buttons, errors, and dialog styling
- tables.css — shared tables, empty states, status badges, and mobile stacked-row behavior
- panels.css — dashboard metrics/filters/cards plus Clients search and detail panel styling

## Entry Points
- index.html — base HTML shell for Vite
- main.jsx — React bootstrap that renders `App`
- App.jsx — top-level layout and page switching

## Data Flow (Supabase)

```
Component → hooks/components helpers → dataService.js → Supabase tables (deals, payments, hours) → component render
```
