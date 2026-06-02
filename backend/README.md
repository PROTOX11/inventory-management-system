# Inventory & Order Management System - Backend

This is a production-ready, clean, and robust **FastAPI backend** for the Inventory & Order Management System assignment. It provides REST APIs for managing inventory items, customers, orders, and dashboard metrics, communicating with a **PostgreSQL database**.

## Features

- **Products Management**: CRUD operations with unique SKU constraints and initial stock quantity tracking.
- **Customers Management**: Customer data persistence with unique email address constraints.
- **Orders Management**: Order placement with automatic transactional inventory validation and stock reduction.
- **Stock Restocking Logic**:
  - Automatically restores (restacks) product stock quantities when non-shipped and non-delivered orders are deleted.
  - Restores stock when a customer is deleted (applying only to their non-shipped/non-delivered orders).
- **Dashboard Statistics**: Exposes key KPIs (total products, total customers, total orders, total revenue, low-stock count, pending orders count).
- **Relational PostgreSQL Database**: Proper table indexing, foreign key constraints, and relational cascades.
- **Automatic Documentation**: Built-in interactive Swagger UI documentation.

---

## Tech Stack

- **Framework**: FastAPI (Asynchronous Python)
- **Database ORM**: SQLAlchemy 2.0 (Declarative Mapping)
- **Database**: PostgreSQL
- **Data Validation & Parsing**: Pydantic v2
- **Server**: Uvicorn

---

## Database Schema & Relations

The backend database contains the following tables:

### 1. Products Table (`products`)
- `id` (PK, Integer)
- `sku` (String, Unique Index) - Product SKU identifier
- `name` (String, Indexed) - Product name
- `description` (String, Nullable)
- `price` (Integer) - Stored in paise/cents (e.g., 1999 = ₹19.99)
- `quantity` (Integer) - Current remaining stock level
- `initial_quantity` (Integer) - Original stock level initialized upon creation
- `reorder_level` (Integer) - Threshold below which a product is flagged as low stock
- `status` (Enum: active, inactive, discontinued)

### 2. Customers Table (`customers`)
- `id` (PK, Integer)
- `name` (String, Indexed)
- `email` (String, Unique Index)
- `phone` (String, Nullable)
- `address` (String, Nullable)
- `city` / `postal_code` / `country` (String, Nullable)

### 3. Orders Table (`orders`)
- `id` (PK, Integer)
- `customer_id` (FK to `customers.id`, Cascade Delete)
- `status` (Enum: pending, confirmed, shipped, delivered, cancelled)
- `total_amount` (Integer) - Total amount in paise/cents
- `notes` (String, Nullable)
- `created_at` / `updated_at` (DateTime)

### 4. Order Items Table (`order_items`)
- `id` (PK, Integer)
- `order_id` (FK to `orders.id`, Cascade Delete)
- `product_id` (FK to `products.id`, Cascade Delete)
- `quantity` (Integer)
- `unit_price` (Integer) - Unit price in paise/cents captured at time of order
- `total_price` (Integer) - Total line item amount in paise/cents

---

## Business & Validation Rules

1. **Unique Constraints**: SKUs and Customer Emails must be globally unique.
2. **Stock Validation**: Order placement fails with a `400 Bad Request` if any of the items requested exceeds the remaining stock quantity.
3. **Paise/Cent Pricing**: All price operations are handled as integers (paise) to prevent floating-point precision issues.
4. **Auto-Restock Rules**:
   - Deleting a customer or an order will restore the quantities of the products in those orders, provided the order status is not `shipped` or `delivered`.

---

## Setup & Running Instructions

### 1. Prerequisites
- Python 3.9+
- PostgreSQL database instance

### 2. Install dependencies
From the `backend/` directory, set up a virtual environment and install the required modules:
```bash
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Database Connection
Create a `.env` file inside the `backend/` directory:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/inventory_db
```
Replace `postgres` and `password` with your local PostgreSQL credentials.

### 4. Run Server
Start the Uvicorn application server:
```bash
python main.py
```
The API backend will start running at `http://localhost:8000`.

- **Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`
