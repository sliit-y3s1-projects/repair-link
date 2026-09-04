# Feature 3 — Repair Requests API Specification

This document details the REST API specification for **Feature 3: Repair Requests**, implemented according to [`GUIDE.md`](../../../GUIDE.md).

---

## 1. Actor Simulation (Local Development)

Per the development actor guideline in `GUIDE.md`, pass actor headers in requests:

| Header | Example Values | Description |
| :--- | :--- | :--- |
| `x-actor-role` | `consumer`, `technician`, `seller`, `admin` | Active product role |
| `x-actor-id` | `consumer_colombo_01`, `tech_kandy_01` | Unique User UUID / identifier |
| `x-actor-name` | `Kavinda Perera`, `Chaminda Silva` | User display name |
| `x-actor-service-area` | `Colombo`, `Kandy`, `Galle` | Technician service area |
| `x-actor-categories` | `Smartphones,Laptops` | Comma-separated categories covered by technician |

---

## 2. Endpoints Overview

| Method | Endpoint | Role Guard | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/repair-requests/photos/presign` | Any | Generate pre-signed object storage upload URL & key |
| `POST` | `/api/v1/repair-requests` | Consumer | Create new repair request |
| `GET` | `/api/v1/repair-requests` | Any | List/filter repair requests |
| `GET` | `/api/v1/repair-requests/leads` | Technician | Discover eligible leads matching category and service area |
| `GET` | `/api/v1/repair-requests/:id` | Participant / Admin | Get repair request details |
| `POST` | `/api/v1/repair-requests/:id/quotes` | Technician | Submit quote (strictly 1 quote per technician) |
| `POST` | `/api/v1/repair-requests/:id/book` | Consumer | Accept quote and book repair |
| `PATCH` | `/api/v1/repair-requests/:id/status` | Assigned Technician | Update repair work status |
| `POST` | `/api/v1/repair-requests/:id/cancel` | Consumer | Cancel repair request |
| `POST` | `/api/v1/repair-requests/:id/dispute` | Consumer / Assigned Tech | Open a dispute |
| `GET` | `/api/v1/repair-requests/:id/history` | Participant / Admin | Get immutable chronological status history |

---

## 3. Repair Lifecycle State Machine

```text
requested → quoted → booked → in_progress → waiting_for_parts → completed
                       ↘ cancelled                     ↘ disputed
```

- Every transition validates caller authorization and logs an immutable `repair_status_history` record containing actor, old/new status, note, and timestamp.

---

## 4. Sample Requests & Responses

### 1. Generate Pre-Signed Photo Upload URL
`POST /api/v1/repair-requests/photos/presign`

**Request Body:**
```json
{
  "fileName": "front_screen_damage.jpg",
  "fileType": "image/jpeg",
  "fileSize": 2048576
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Pre-signed photo upload URL generated successfully",
  "data": {
    "key": "photos/requests/1725432000000_a1b2c3/front_screen_damage.jpg",
    "uploadUrl": "https://storage.repairlink.lk/upload/photos/requests/1725432000000_a1b2c3/front_screen_damage.jpg?token=mock_presigned_1725432000000",
    "fileName": "front_screen_damage.jpg",
    "fileType": "image/jpeg",
    "fileSize": 2048576,
    "expiresInSeconds": 900
  }
}
```

---

### 2. Create Repair Request
`POST /api/v1/repair-requests`  
Headers: `x-actor-role: consumer`, `x-actor-id: consumer_colombo_01`, `x-actor-name: Kavinda Perera`

**Request Body:**
```json
{
  "deviceCategory": "Smartphones",
  "deviceBrand": "Apple",
  "deviceModel": "iPhone 13 Pro",
  "issueDescription": "Front screen glass cracked after dropping on tiled floor. Touch still functions. Needs genuine OLED display replacement.",
  "photos": [
    {
      "key": "photos/requests/1725432000000_a1b2c3/front_screen_damage.jpg",
      "fileName": "front_screen_damage.jpg",
      "fileType": "image/jpeg",
      "fileSize": 2048576,
      "url": "https://storage.repairlink.lk/photos/requests/1725432000000_a1b2c3/front_screen_damage.jpg"
    }
  ],
  "preferredRepairMethod": "carry_in",
  "approximateLocation": "Colombo 03 (Kollupitiya)",
  "preferredTime": "Weekday mornings after 10 AM",
  "budget": 35000,
  "contactPhone": "0778123456"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Repair request created successfully",
  "data": {
    "id": "req_1725432000_xyz12",
    "consumerId": "consumer_colombo_01",
    "consumerName": "Kavinda Perera",
    "deviceCategory": "Smartphones",
    "deviceBrand": "Apple",
    "deviceModel": "iPhone 13 Pro",
    "status": "requested",
    "photos": [
      {
        "key": "photos/requests/1725432000000_a1b2c3/front_screen_damage.jpg",
        "fileName": "front_screen_damage.jpg",
        "fileType": "image/jpeg",
        "fileSize": 2048576
      }
    ],
    "quotes": [],
    "createdAt": "2026-09-04T08:00:00.000Z",
    "updatedAt": "2026-09-04T08:00:00.000Z"
  }
}
```

---

### 3. Discover Eligible Leads (Technician Only)
`GET /api/v1/repair-requests/leads`  
Headers: `x-actor-role: technician`, `x-actor-id: tech_colombo_01`, `x-actor-service-area: Colombo`, `x-actor-categories: Smartphones,Audio`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Eligible repair leads retrieved based on active technician profile categories and service area",
  "data": {
    "technicianId": "tech_colombo_01",
    "serviceArea": "Colombo",
    "categories": ["Smartphones", "Audio"],
    "totalLeads": 1,
    "leads": [
      {
        "id": "req_colombo_001",
        "deviceCategory": "Smartphones",
        "deviceBrand": "Apple",
        "deviceModel": "iPhone 13 Pro",
        "approximateLocation": "Colombo 03 (Kollupitiya)",
        "status": "requested",
        "preferredRepairMethod": "carry_in"
      }
    ]
  }
}
```

---

### 4. Submit Quote (Technician Only — 1 Quote per Request)
`POST /api/v1/repair-requests/:id/quotes`  
Headers: `x-actor-role: technician`, `x-actor-id: tech_colombo_01`, `x-actor-service-area: Colombo`, `x-actor-categories: Smartphones`

**Request Body:**
```json
{
  "amount": 32000,
  "currency": "LKR",
  "message": "Genuine OEM screen replacement with 90 days warranty. Ready within 2 hours.",
  "estimatedDurationHours": 2
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Quote submitted successfully and request status moved to quoted",
  "data": {
    "request": {
      "id": "req_colombo_001",
      "status": "quoted"
    },
    "quote": {
      "id": "quote_1725432000_abc99",
      "technicianId": "tech_colombo_01",
      "amount": 32000,
      "currency": "LKR",
      "status": "sent"
    }
  }
}
```
*(If the technician attempts to quote a second time, the API returns `400 Bad Request: Technicians may quote only once per repair request`)*.

---

### 5. Accept Quote and Book (Consumer Only)
`POST /api/v1/repair-requests/:id/book`  
Headers: `x-actor-role: consumer`, `x-actor-id: consumer_colombo_01`

**Request Body:**
```json
{
  "quoteId": "quote_1725432000_abc99",
  "scheduledAt": "2026-09-08T10:30:00Z",
  "notes": "Dropping off at Kollupitiya lab"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Quote accepted and repair request booked successfully",
  "data": {
    "id": "req_colombo_001",
    "status": "booked",
    "assignedTechnicianId": "tech_colombo_01",
    "booking": {
      "id": "book_1725432000_bb11",
      "acceptedQuoteId": "quote_1725432000_abc99",
      "scheduledAt": "2026-09-08T10:30:00Z"
    }
  }
}
```

---

### 6. Update Repair Work Status (Assigned Technician Only)
`PATCH /api/v1/repair-requests/:id/status`  
Headers: `x-actor-role: technician`, `x-actor-id: tech_colombo_01`

**Request Body:**
```json
{
  "status": "in_progress",
  "note": "Device received at lab. Initial diagnostic completed, replacing display unit."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Status transitioned to in_progress with immutable history record created",
  "data": {
    "id": "req_colombo_001",
    "status": "in_progress",
    "updatedAt": "2026-09-04T09:00:00.000Z"
  }
}
```

---

### 7. Open Dispute (Participant Only)
`POST /api/v1/repair-requests/:id/dispute`  
Headers: `x-actor-role: consumer`, `x-actor-id: consumer_colombo_01`

**Request Body:**
```json
{
  "reason": "Display adhesive peeling on the top corner after 3 days of use."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dispute opened successfully and recorded in status history",
  "data": {
    "id": "req_colombo_001",
    "status": "disputed"
  }
}
```

---

### 8. View Immutable Status History Audit Trail
`GET /api/v1/repair-requests/:id/history`  
Headers: `x-actor-role: consumer`, `x-actor-id: consumer_colombo_01`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Immutable repair status history retrieved successfully",
  "data": {
    "repairRequestId": "req_colombo_001",
    "totalTransitions": 5,
    "history": [
      {
        "id": "rsh_001",
        "actor": { "id": "consumer_colombo_01", "name": "Kavinda Perera", "role": "consumer" },
        "oldStatus": null,
        "newStatus": "requested",
        "note": "Repair request submitted by consumer",
        "timestamp": "2026-09-04T08:00:00.000Z"
      },
      {
        "id": "rsh_002",
        "actor": { "id": "tech_colombo_01", "name": "Sunil Repairs", "role": "technician" },
        "oldStatus": "requested",
        "newStatus": "quoted",
        "note": "Quote received from Sunil Repairs (LKR 32000)",
        "timestamp": "2026-09-04T08:30:00.000Z"
      },
      {
        "id": "rsh_003",
        "actor": { "id": "consumer_colombo_01", "name": "Kavinda Perera", "role": "consumer" },
        "oldStatus": "quoted",
        "newStatus": "booked",
        "note": "Quote accepted and repair scheduled for 2026-09-08T10:30:00Z",
        "timestamp": "2026-09-04T08:45:00.000Z"
      },
      {
        "id": "rsh_004",
        "actor": { "id": "tech_colombo_01", "name": "Sunil Repairs", "role": "technician" },
        "oldStatus": "booked",
        "newStatus": "in_progress",
        "note": "Device received at lab. Replacing display unit.",
        "timestamp": "2026-09-04T09:00:00.000Z"
      },
      {
        "id": "rsh_005",
        "actor": { "id": "consumer_colombo_01", "name": "Kavinda Perera", "role": "consumer" },
        "oldStatus": "in_progress",
        "newStatus": "disputed",
        "note": "Dispute opened by consumer (Kavinda Perera): Display adhesive peeling",
        "timestamp": "2026-09-04T09:30:00.000Z"
      }
    ]
  }
}
```

