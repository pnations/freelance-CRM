# Freelance CRM Dashboard

A lightweight, professional CRM dashboard for managing freelance clients, orders, payments, and hours tracking. Built with React, Vite, and vanilla CSS with a beautiful teal color scheme.

**Status**: Early version with Supabase-backed data.

## Features

- **Dashboard Overview** - Real-time metrics: total revenue, paid revenue, pending payments, total hours (auto-refreshes every 30 seconds)
- **Client Management** - Add, edit, and manage client information with contact details and project history
- **Client Search** - Search clients by name, contact person, email, phone, or notes
- **Order Management** - Create and track orders with client name, project type, status, and cost
- **Payments & Hours** - Log payments with optional hours and comments in one unified logged table
- **Advanced Filtering** - Filter orders by status, client name, and project type
- **Mobile-First Navigation** - Hamburger drawer on small screens with desktop sidebar on larger screens
- **Professional UI** - Clean, responsive design with teal color scheme and smooth interactions
- **Read-Only Fallback** - When Supabase is not configured, the app stays accessible in read-only mode
- **Responsive Design** - Fully responsive on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 18, Vite, Vanilla CSS
- **Backend**: Supabase
- **Features**: Auto-refresh dashboard, real-time calculations, responsive layout

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/freelance-crm-dashboard.git
   cd freelance-crm-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running the App

**Development mode:**
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the app.

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

## Data Mode

The app runs in Supabase-only mode. If Supabase environment variables are missing, the UI stays available in read-only mode and write actions are disabled.

## Future Roadmap

### Recently Completed

- [x] Supabase-backed persistent data
- [x] Mobile-first navigation with hamburger drawer
- [x] Shared CRUD hooks and reusable action components
- [x] Unified Payments + Hours logging workflow

### Up Next

- [ ] User authentication and login
- [ ] AI-powered insights and recommendations
- [ ] Dark mode toggle
- [ ] Data export (CSV, PDF)
- [ ] Advanced reporting and analytics

## Environment Variables

Create a `.env.local` file:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Supabase Migration (Required)

Run this SQL in the Supabase SQL Editor to support unified Payments + Hours logging:

```sql
alter table public.payments
   add column if not exists hours numeric,
   add column if not exists comment text;
```

Versioned file in this repo:
- `supabase/migrations/20260327_add_payments_hours_comment.sql`

Notes:
- Both columns are nullable so existing rows remain valid.
- The app writes optional hours to `payments.hours` and optional notes to `payments.comment`.

## Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx
│   ├── Clients.jsx
│   ├── ConfirmDialog.jsx
│   ├── Navigation.jsx
│   ├── OrderForm.jsx
│   ├── PaymentTracker.jsx
│   └── TableActions.jsx
├── hooks/
│   ├── useConfirmDelete.js
│   └── useCrudForm.js
├── services/
│   ├── dataService.js (data management)
│   └── supabase.js (Supabase config)
├── styles/
│   ├── dashboard.css
│   ├── forms.css
│   └── clients.css
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

### Architecture Notes

- Mobile-first app shell with drawer navigation is implemented via `App.jsx`, `App.css`, and `components/Navigation.jsx`.
- Shared CRUD behavior is centralized in `hooks/useConfirmDelete.js` and `hooks/useCrudForm.js`.
- Shared action buttons and confirmation UX are centralized in `components/TableActions.jsx` and `components/ConfirmDialog.jsx`.

## Color Scheme

- **Primary Teal**: #0d9488
- **Secondary Purple**: #8b5cf6
- **Warning**: #f59e0b
- **Info**: #3b82f6
- **Error**: #ef4444

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel auto-detects Vite and deploys automatically
5. Your site is live!

### Netlify

1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

### Traditional Hosting

1. Build the project: `npm run build`
2. Upload the `dist/` folder contents to your hosting provider

## License

MIT

## Author

Philip Nations
