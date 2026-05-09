# Kolluvelil - Rental Management System

A premium web application for managing rental properties, tenants, and collections.

## Features
- **Tenant Management**: Register new clients with full details and address.
- **Document Attachments**: Attach ID proofs, rental agreements, and other documents.
- **Rent Tracking**: Record payments with month/year tracking and payment methods.
- **Instant Receipts**: Automatically generate professional rent receipts with print/PDF support.
- **Financial Reports**: View revenue summaries, occupancy trends, and collection reports.

## Technology Stack
- **Frontend**: React.js with Vite
- **Styling**: Vanilla CSS (Custom Design System with Glassmorphism)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Persistence**: LocalStorage (can be easily migrated to a backend)

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```

## Folder Structure
- `src/context/`: State management using React Context.
- `src/pages/`: Individual page components (Dashboard, Clients, Payments, Reports).
- `src/index.css`: Core design system and global styles.
- `src/App.jsx`: Main routing and layout configuration.
