# Inventory & Order Management System - Frontend

This is a modern, responsive, and feature-rich React-based web interface built for the **Inventory & Order Management System** assessment/assignment. It is built using **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui** components.

## Features

### 💻 Merchant Dashboard
- **Key Performance Indicators (KPIs)**: Real-time calculation of total products, total customers, total orders, and total revenue.
- **Data Visualizations**: Responsive charts powered by Recharts:
  - **Stock Levels (Bar Chart)**: Visual representation of stock quantities per product.
  - **Order Status Distribution (Pie Chart)**: Real-time distribution of orders across status workflows.
  - **Order Trend (Line Chart)**: Tracking purchase volumes.
- **Alert Notifications**: Automatic banners highlighting low-stock items and pending orders.

### 🛍 Product Management
- Full CRUD operations (Add, Edit, View, Delete products).
- Form validation with Zod schemas.
- Unique SKU checking.
- Automated real-time update of stock quantities.

### 👥 Customer Management
- Maintain a database of customers (Create, Edit, View, Delete).
- Unique email validation and contact info tracking.

### 📦 Orders Management
- **Merchant Panel**:
  - View all customer orders.
  - Create new orders with search/auto-selection for customers and products.
  - Update order status (Pending → Confirmed → Shipped → Delivered / Cancelled).
  - Delete order endpoint support (restores corresponding item quantities back to the stock).
- **Customer Panel**:
  - Browse active products shop.
  - Interactive shopping cart.
  - Real-time stock validation (prevents ordering more items than available).
  - View order history and status.

### 🔔 Inventory Monitoring
- Live 1-second auto-refreshed stock tracker with status badges:
  - `Out of Stock` (0 units)
  - `Low Stock` (< 10 units)
  - `Moderate` (< 50 units)
  - `Healthy` (>= 50 units)
- Quick search filter by SKU or product name.

---

## Technical Architecture & Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State & Form Handling**: React Hook Form + Zod validation
- **Data Visualization**: Recharts
- **Styling**: Tailwind CSS + shadcn/ui components (Radix primitives)
- **Icons**: Lucide React
- **API Client**: REST API integration utilizing a unified client class

---

## Directory Structure

```
├── app/
│   ├── dashboard/       # Merchant Dashboard metrics & charts
│   ├── products/        # Product CRUD page
│   ├── customers/       # Customer CRUD page
│   ├── orders/          # Merchant order list & creation form
│   ├── inventory/       # Real-time stock level tracker
│   ├── shop/            # Customer product browse & shopping cart
│   └── my-orders/       # Customer order history tracking
├── components/
│   ├── app-sidebar.tsx  # Navigation sidebar
│   ├── product-form.tsx # Product create/edit modal form
│   ├── order-form.tsx   # Order create form with stock check
│   ├── ui/              # Reusable Radix UI / shadcn wrapper components
├── lib/
│   ├── api-client.ts    # Centralized HTTP request client with TypeScript definitions
│   ├── types.ts         # Global interface types (Product, Order, Customer, etc.)
│   └── validation.ts    # Zod schemas for client-side forms
```

---

## Setup & Running Instructions

### 1. Install dependencies
Ensure you have Node.js 18+ and `pnpm` installed.
```bash
pnpm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 3. Run Development Server
```bash
pnpm dev
```
The application will be available at `http://localhost:3000`.
