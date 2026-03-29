# Project File Structure

```
dashboard/
├── Documentation
│   ├── README.md
│   ├── QUICK_START.md
│   ├── DEPLOYMENT.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── START_HERE.md
│   ├── DOCUMENTATION_INDEX.md
│   ├── PROJECT_SUMMARY.txt
│   └── FILE_STRUCTURE.md
│
├── Configuration
│   ├── package.json
│   ├── vite.config.js
│   ├── .env                (local only, not committed)
│   └── .env.example        (sample env values)
│
├── src
│   ├── components
│   │   ├── Dashboard.jsx
│   │   ├── Clients.jsx
│   │   ├── OrderForm.jsx
│   │   └── PaymentTracker.jsx
│   │
│   ├── services
│   │   ├── supabase.js
│   │   └── dataService.js
│   │
│   ├── styles
│   │   ├── dashboard.css
│   │   └── forms.css
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── index.html
└── node_modules/ (generated)
```

## Documentation
- README.md — full overview, setup, and usage
- QUICK_START.md — fastest path to run the app
- DEPLOYMENT.md — Supabase + frontend deployment guidance
- IMPLEMENTATION_SUMMARY.md — what is built and open items
- START_HERE.md — orientation and pointers to key docs
- DOCUMENTATION_INDEX.md — doc map
- PROJECT_SUMMARY.txt — short project description
- FILE_STRUCTURE.md — this file

## Configuration
- package.json — React/Vite dependencies and npm scripts
- vite.config.js — Vite build config
- .env — local environment variables (not checked in)
- .env.example — sample values for onboarding (uses Supabase)
- Required env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

## React Components
- Dashboard.jsx — metrics overview and data table fed by Supabase data
- Clients.jsx — create, update, and delete client records and view related projects
- OrderForm.jsx — create, update, and delete orders
- PaymentTracker.jsx — log payments with optional hours/comments and manage a unified payments log

## Services
- supabase.js — initializes the Supabase client from environment variables
- dataService.js — CRUD helpers for `clients`, `orders`, `payments`, and `hours` tables

## Styling
- App.css — layout and navigation styling
- dashboard.css — metrics grid, filters, and table styling
- forms.css — shared form, input, button, and responsive rules

## Entry Points
- index.html — base HTML shell for Vite
- main.jsx — React bootstrap that renders `App`
- App.jsx — top-level layout and page switching

## Data Flow (Supabase)

```
Component → dataService.js → Supabase tables (clients, orders, payments, hours) → component render
```
