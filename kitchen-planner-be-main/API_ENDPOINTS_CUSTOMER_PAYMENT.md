# Customer & Payment API Endpoints

## Customer Endpoints

### 1. Create Customer
**POST** `/api/customer`

Creates a new customer profile for a user.

**Request Body:**
```json
{
  "userId": "user_id_here",
  "billingInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "United States"
    },
    "company": "ABC Corp",
    "taxId": "TAX123456"
  },
  "preferences": {
    "dietaryRestrictions": ["vegetarian", "gluten-free"],
    "allergies": ["nuts", "shellfish"],
    "preferredPaymentMethod": "card",
    "newsletterSubscription": true,
    "marketingEmails": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "_id": "customer_id",
    "customerId": "CUST000001",
    "user": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "billingInfo": { ... },
    "preferences": { ... },
    "loyaltyPoints": 0,
    "totalOrders": 0,
    "totalSpent": 0,
    "status": "active"
  }
}
```

### 2. Get All Customers (Admin Only)
**GET** `/api/customer?page=1&limit=10&status=active&search=john`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (active, inactive, suspended)
- `search`: Search by name, email, or customer ID

**Response:**
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": {
    "customers": [...],
    "totalPages": 5,
    "currentPage": 1,
    "total": 50
  }
}
```

### 3. Get Customer by ID
**GET** `/api/customer/:id`

**Response:**
```json
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": {
    "_id": "customer_id",
    "customerId": "CUST000001",
    "user": { ... },
    "billingInfo": { ... },
    "preferences": { ... },
    "loyaltyPoints": 150,
    "totalOrders": 5,
    "totalSpent": 250.00,
    "status": "active",
    "orders": [...]
  }
}
```

### 4. Get Customer by User ID
**GET** `/api/customer/user/:userId`

### 5. Update Customer
**PUT** `/api/customer/:id`

**Request Body:**
```json
{
  "billingInfo": {
    "phone": "+1987654321"
  },
  "preferences": {
    "dietaryRestrictions": ["vegan"]
  },
  "status": "active",
  "notes": "VIP customer"
}
```

### 6. Update Billing Info
**PUT** `/api/customer/:id/billing`

**Request Body:**
```json
{
  "billingInfo": {
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90210"
    }
  }
}
```

### 7. Update Preferences
**PUT** `/api/customer/:id/preferences`

**Request Body:**
```json
{
  "preferences": {
    "preferredPaymentMethod": "paypal",
    "newsletterSubscription": false
  }
}
```

### 8. Add Loyalty Points (Admin Only)
**POST** `/api/customer/:id/loyalty-points`

**Request Body:**
```json
{
  "points": 50,
  "reason": "Referral bonus"
}
```

### 9. Get Customer Statistics (Admin Only)
**GET** `/api/customer/stats`

**Response:**
```json
{
  "success": true,
  "message": "Customer statistics retrieved successfully",
  "data": {
    "totalCustomers": 150,
    "activeCustomers": 120,
    "inactiveCustomers": 20,
    "suspendedCustomers": 10,
    "totalLoyaltyPoints": 15000,
    "totalOrders": 500,
    "totalSpent": 25000.00,
    "averageSpent": 166.67
  }
}
```

### 10. Delete Customer (Admin Only)
**DELETE** `/api/customer/:id`

---

## Payment Endpoints

### 1. Create Payment
**POST** `/api/payment`

**Request Body:**
```json
{
  "orderId": "order_id_here",
  "customerId": "customer_id_here",
  "amount": 150.00,
  "currency": "USD",
  "type": "stripe",
  "method": "credit_card",
  "paymentDetails": {
    "cardType": "visa",
    "last4Digits": "1234",
    "cardBrand": "Visa",
    "transactionId": "txn_123456789"
  },
  "billingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  },
  "fees": {
    "processingFee": 2.50,
    "taxAmount": 12.00,
    "discountAmount": 10.00
  },
  "metadata": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "deviceType": "desktop",
    "location": "New York, NY"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "_id": "payment_id",
    "paymentId": "PAY00000001",
    "order": {
      "_id": "order_id",
      "orderId": "ORD001",
      "total": 150.00,
      "status": "pending"
    },
    "customer": {
      "_id": "customer_id",
      "customerId": "CUST000001",
      "billingInfo": { ... }
    },
    "amount": 150.00,
    "currency": "USD",
    "type": "stripe",
    "method": "credit_card",
    "status": "pending",
    "paymentDetails": { ... },
    "fees": { ... }
  }
}
```

### 2. Get All Payments (Admin Only)
**GET** `/api/payment?page=1&limit=10&status=completed&type=stripe&startDate=2024-01-01&endDate=2024-12-31`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `type`: Filter by payment type
- `method`: Filter by payment method
- `startDate`: Filter by start date
- `endDate`: Filter by end date

### 3. Get Payment by ID
**GET** `/api/payment/:id`

### 4. Get Payments by Order ID
**GET** `/api/payment/order/:orderId`

### 5. Get Payments by Customer ID
**GET** `/api/payment/customer/:customerId?page=1&limit=10`

### 6. Update Payment Status (Admin Only)
**PUT** `/api/payment/:id/status`

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Payment processed successfully"
}
```

### 7. Process Refund (Admin Only)
**POST** `/api/payment/:id/refund`

**Request Body:**
```json
{
  "refundAmount": 50.00,
  "reason": "Customer requested partial refund"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "_id": "payment_id",
    "paymentId": "PAY00000001",
    "amount": 150.00,
    "refundInfo": {
      "refundedAmount": 50.00,
      "refundReason": "Customer requested partial refund",
      "refundedAt": "2024-01-15T10:30:00.000Z"
    },
    "status": "completed"
  }
}
```

### 8. Get Payment Statistics (Admin Only)
**GET** `/api/payment/stats?startDate=2024-01-01&endDate=2024-12-31`

**Response:**
```json
{
  "success": true,
  "message": "Payment statistics retrieved successfully",
  "data": {
    "totalPayments": 1000,
    "totalAmount": 50000.00,
    "averageAmount": 50.00,
    "completedPayments": 950,
    "failedPayments": 30,
    "refundedPayments": 20,
    "totalRefundedAmount": 1000.00,
    "methodDistribution": [
      {
        "_id": "credit_card",
        "count": 600,
        "totalAmount": 30000.00
      },
      {
        "_id": "paypal",
        "count": 300,
        "totalAmount": 15000.00
      }
    ],
    "typeDistribution": [
      {
        "_id": "stripe",
        "count": 700,
        "totalAmount": 35000.00
      },
      {
        "_id": "paypal",
        "count": 300,
        "totalAmount": 15000.00
      }
    ]
  }
}
```

### 9. Delete Payment (Admin Only)
**DELETE** `/api/payment/:id`

---

## Updated Order Endpoints

### Create Order (Updated)
**POST** `/api/order`

**Request Body:**
```json
{
  "meals": [
    {
      "_id": "meal_id",
      "qty": 2
    }
  ],
  "total": 150.00,
  "subTotal": 140.00,
  "tax": 10.00,
  "deliveryFee": 5.00,
  "discount": 5.00,
  "billingInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  },
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States",
    "instructions": "Leave at front door"
  },
  "specialInstructions": "Extra spicy please"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "order_id",
    "orderId": "ORD001",
    "user": { ... },
    "customer": {
      "_id": "customer_id",
      "customerId": "CUST000001",
      "billingInfo": { ... }
    },
    "meals": [...],
    "total": 150.00,
    "subTotal": 140.00,
    "tax": 10.00,
    "deliveryFee": 5.00,
    "discount": 5.00,
    "status": "pending",
    "deliveryAddress": { ... },
    "specialInstructions": "Extra spicy please"
  }
}
```

---

## Authentication

All endpoints require authentication except where noted. Use the following headers:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": 400,
    "details": "Additional error details"
  }
}
```

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error 