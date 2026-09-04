# Feature 6 — Spare Parts Marketplace API Specification

This document describes the REST API contracts for the **Spare Parts Marketplace** (`/api/v1/parts` and `/api/v1/orders`), implemented according to [`GUIDE.md`](../../../GUIDE.md).

---

## 1. Actor Simulation (Local Development)

Per the project guide, pass actor credentials via request headers:

| Header | Example Values | Description |
| :--- | :--- | :--- |
| `x-actor-role` | `seller`, `consumer`, `technician`, `admin` | Active product role |
| `x-actor-id` | `seller_colombo_01`, `consumer_kandy_01` | Unique User UUID / ID |
| `x-actor-name` | `Ruwan Perera`, `Nimal Fernando` | Display Name |
| `x-store-name` | `Pettah Tech Spares Hub` | Storefront Name (for sellers) |

---

## 2. Endpoints Overview

### Spare Parts Discovery
- `GET /api/v1/parts` — Search and filter active spare parts
- `GET /api/v1/parts/:id` — Get single spare part details

### Seller Listings Management
- `POST /api/v1/parts` — Create a new spare part listing (Seller only)
- `PATCH /api/v1/parts/:id` — Update listing or stock (Owner seller only)

### Orders & Inventory Transactions
- `POST /api/v1/orders` — Purchase part (Atomic stock decrement & snapshot unit price)
- `GET /api/v1/orders` — Get current user's orders (Buyer purchases or Seller sales)
- `GET /api/v1/orders/:orderId` — View order details with historical snapshot price

---

## 3. Sample Requests & Responses

### Search Spare Parts
`GET /api/v1/parts?query=samsung&condition=new&inStockOnly=true`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Spare parts retrieved successfully",
  "data": {
    "total": 1,
    "parts": [
      {
        "id": "part_001",
        "name": "Samsung Galaxy A52 / A52s Super AMOLED Display Assembly",
        "sku": "DISP-SAM-A52-OEM",
        "condition": "new",
        "price": 14500,
        "quantity": 8,
        "sellerStoreName": "Pettah Tech Spares Hub",
        "warrantyDays": 90,
        "deliveryOptions": [
          "Shop Pickup (1st Cross St, Pettah)",
          "Island-wide Courier (Prompt Express)"
        ]
      }
    ]
  }
}
```

---

### Create Part Listing (Seller Only)
`POST /api/v1/parts`  
Headers: `x-actor-role: seller`, `x-actor-id: seller_colombo_01`

```json
{
  "name": "MacBook Pro 13 M1 (A2338) Replacement Trackpad",
  "categoryId": "cat_trackpad",
  "compatibleDevices": "MacBook Pro 13-inch 2020 M1",
  "sku": "TP-APL-A2338-GRY",
  "condition": "refurbished",
  "price": 18500,
  "quantity": 3,
  "warrantyDays": 90,
  "images": ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
  "deliveryOptions": ["Shop Pickup (Liberty Plaza)", "Courier Delivery"]
}
```

---

### Place Order (Atomic Stock Decrement & Snapshot Unit Price)
`POST /api/v1/orders`  
Headers: `x-actor-role: consumer`, `x-actor-id: consumer_kandy_01`

```json
{
  "listingId": "part_001",
  "quantity": 2,
  "shippingAddress": "No. 45, Peradeniya Road, Kandy",
  "contactPhone": "0771234567",
  "notes": "Please ship via Pronto courier"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order placed successfully and inventory updated transactionally",
  "data": {
    "id": "order_1725432000_abc12",
    "listingId": "part_001",
    "listingName": "Samsung Galaxy A52 / A52s Super AMOLED Display Assembly",
    "quantity": 2,
    "unitPrice": 14500,
    "totalAmount": 29000,
    "status": "confirmed",
    "shippingAddress": "No. 45, Peradeniya Road, Kandy"
  }
}
```
*(Notice stock for `part_001` immediately decrements from 8 to 6).*
