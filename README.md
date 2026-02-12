# Freelance CRM Dashboard

A lightweight, professional CRM dashboard for managing freelance clients, orders, payments, and hours tracking. Built with React, Vite, and vanilla CSS with a beautiful teal color scheme.

**Status**: Demo version with sample data. Supabase integration coming soon.

## Features

- **Dashboard Overview** - Real-time metrics: total revenue, paid revenue, pending payments, total hours (auto-refreshes every 30 seconds)
- **Client Management** - Add, edit, and manage client information with contact details and project history
- **Client Search** - Search clients by name, contact person, email, phone, or notes
- **Order Management** - Create and track orders with client name, project type, status, and cost
- **Payment Tracking** - Log and track payments with different methods and dates
- **Hours Logger** - Track time spent on each project
- **Advanced Filtering** - Filter orders by status, client name, and project type
- **Professional UI** - Clean, responsive design with teal color scheme and smooth interactions
- **Demo Mode** - Built-in demo mode with sample data (currently active)
- **Responsive Design** - Fully responsive on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 18, Vite, Vanilla CSS
- **Demo Data**: In-memory storage
- **Backend**: Supabase (coming soon)
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

## Demo Data

The app comes with sample clients and orders to showcase functionality. All data is stored in memory and resets on page reload.

## Future Roadmap

- [ ] Supabase integration for persistent data storage
- [ ] User authentication and login
- [ ] AI-powered insights and recommendations
- [ ] Dark mode toggle
- [ ] Data export (CSV, PDF)
- [ ] Advanced reporting and analytics

## Environment Variables

When Supabase is integrated, create a `.env.local` file:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx
│   ├── Clients.jsx
│   ├── OrderForm.jsx
│   ├── PaymentTracker.jsx
│   └── HoursLogger.jsx
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
