# Full-Stack Inventory & Order Management System

This repository contains a full-stack **Inventory & Order Management System** submitted as a software engineering assessment/assignment. It consists of a modern, responsive React/Next.js frontend and a fast, transactional Python/FastAPI backend with a PostgreSQL database.

## Project Structure

The project is structured into two main directories:
1. **[Frontend (Next.js)](README_FRONTEND.md)**: React-based web dashboard interface built with TypeScript, Tailwind CSS, and shadcn/ui.
2. **[Backend (FastAPI)](backend/README.md)**: Python REST API backend built with SQLAlchemy 2.0 and PostgreSQL.

---

## Key Features

- **Merchant Dashboard**: Rich data visualizations showing KPIs (total revenue in ₹, active users, orders) and charts (stock levels bar chart, status pie chart, order trend line chart).
- **Interactive Shop**: Customer interface to browse items, add to cart, and checkout with transactional validation.
- **Form Validation**: Strict client-side and server-side validation using Zod schemas and Pydantic models.
- **Inventory Tracking**: Real-time 2-second auto-refreshing stock levels monitor with status badges (Healthy, Moderate, Low, Out of Stock).
- **Auto-Restock Rules**: Product quantities are automatically restored (restacked) when orders (except shipped/delivered ones) are deleted, or when associated customers are deleted.
- **Rupees Localization**: Amounts and revenue values are fully localized using the Rupees (`₹`) currency symbol.

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Forms & Validation**: React Hook Form + Zod
- **Data Visualization**: Recharts
- **Styling**: Tailwind CSS + shadcn/ui (Radix primitives)

### Backend
- **Framework**: FastAPI (Python)
- **Database ORM**: SQLAlchemy 2.0 (Declarative Mapping)
- **Database**: PostgreSQL
- **Server**: Uvicorn

---

## Screenshots

### 🛍️ Merchant Views

#### Dashboard
![Dashboard](public/Project_ScreenShots/Merchant/Dashboard.png)

#### Products
![Products](public/Project_ScreenShots/Merchant/Products.png)

#### Add Product
![Add Product](public/Project_ScreenShots/Merchant/Add_Product.png)

#### Update Product Status
![Update Product Status](public/Project_ScreenShots/Merchant/Update_Product_Status.png)

#### Inventory — Live Stock Monitor
![Inventory](public/Project_ScreenShots/Merchant/Inventory.png)

#### Orders
![Orders](public/Project_ScreenShots/Merchant/Orders.png)

#### Order Detail
![Order Detail](public/Project_ScreenShots/Merchant/order_detail.png)

#### Customers
![Customers](public/Project_ScreenShots/Merchant/Customer.png)

---

### 🛒 Customer Views

#### Browse Shop
![Browse Shop](public/Project_ScreenShots/Customers/Browse_Shop.png)

#### View Cart
![View Cart](public/Project_ScreenShots/Customers/View_Cart.png)

#### My Orders
![My Orders](public/Project_ScreenShots/Customers/My_Orders.png)

---

## Quick Start Setup

### 1. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment, then install dependencies:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```
3. Configure your database URL in a `.env` file:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db
   ```
4. Run the backend server:
   ```bash
   python main.py
   ```
   The backend API will run at `http://localhost:8000`.

### 2. Frontend Setup
1. From the root directory, install dependencies:
   ```bash
   pnpm install
   ```
2. Configure your environment URL in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```
3. Run the frontend development server:
   ```bash
   pnpm dev
   ```
   The web dashboard will be accessible at `http://localhost:3000`.

## 🐳 Running with Docker (Recommended)

You can spin up the entire full-stack application (PostgreSQL, FastAPI backend, and Next.js frontend) in a single command from the root directory:

```bash
docker-compose up --build
```

Once building and initialization completes:
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API Server**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
