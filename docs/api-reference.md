# Farm2Fork API Reference

This document provides detailed information about the Farm2Fork API endpoints, request parameters, and response formats.

## Base URL

```
https://api.farm2fork.com
```

For local development:

```
http://localhost:5000
```

## Authentication

Most API endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API returns standard HTTP status codes to indicate success or failure:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses have the following format:

```json
{
  "success": false,
  "error": {
    "message": "Error message description"
  }
}
```

## Endpoints

### Authentication

#### Register User

```
POST /api/auth/register
```

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "consumer", // or "farmer"
  "phone": "555-123-4567" // optional
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt_token_here",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "consumer",
    "phone": "555-123-4567",
    "created_at": "2023-06-01T12:00:00Z"
  }
}
```

#### Login

```
POST /api/auth/login
```

Authenticate a user and get a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "jwt_token_here",
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "consumer",
    "phone": "555-123-4567",
    "created_at": "2023-06-01T12:00:00Z"
  }
}
```

#### Get Current User

```
GET /api/auth/me
```

Get the currently authenticated user's information.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "consumer",
    "phone": "555-123-4567",
    "created_at": "2023-06-01T12:00:00Z"
  }
}
```

### Products

#### Get All Products

```
GET /api/products
```

Get a list of all products.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)
- `sort_by`: Field to sort by (default: created_at)
- `order`: Sort order, 'asc' or 'desc' (default: desc)

**Response:**

```json
{
  "success": true,
  "count": 100,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  },
  "data": [
    {
      "id": "product_id",
      "name": "Organic Carrots",
      "description": "Fresh organic carrots",
      "price": 3.99,
      "unit": "bunch",
      "stock_quantity": 50,
      "image": "https://example.com/carrots.jpg",
      "is_organic": true,
      "is_featured": true,
      "farmer": {
        "id": "farmer_id",
        "farm_name": "Green Valley Farm",
        "location": "Greenfield, CA",
        "profile_image": "https://example.com/farmer.jpg"
      },
      "category": {
        "id": "category_id",
        "name": "Vegetables"
      }
    }
    // More products...
  ]
}
```

#### Get Product by ID

```
GET /api/products/:id
```

Get a single product by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "product_id",
    "name": "Organic Carrots",
    "description": "Fresh organic carrots",
    "price": 3.99,
    "unit": "bunch",
    "stock_quantity": 50,
    "image": "https://example.com/carrots.jpg",
    "is_organic": true,
    "is_featured": true,
    "farmer": {
      "id": "farmer_id",
      "farm_name": "Green Valley Farm",
      "location": "Greenfield, CA",
      "profile_image": "https://example.com/farmer.jpg",
      "description": "Family-owned farm specializing in organic vegetables",
      "user": {
        "first_name": "John",
        "last_name": "Farmer",
        "email": "farmer@example.com"
      }
    },
    "category": {
      "id": "category_id",
      "name": "Vegetables",
      "description": "Fresh, locally grown vegetables"
    },
    "reviews": [
      {
        "id": "review_id",
        "rating": 5,
        "comment": "Great product!",
        "user": {
          "first_name": "Jane",
          "last_name": "Consumer"
        },
        "created_at": "2023-06-01T12:00:00Z"
      }
      // More reviews...
    ]
  }
}
```

#### Create Product (Farmers Only)

```
POST /api/products
```

Create a new product.

**Request Body:**

```json
{
  "name": "Organic Carrots",
  "description": "Fresh organic carrots",
  "price": 3.99,
  "unit": "bunch",
  "stock_quantity": 50,
  "category_id": "category_id",
  "image": "https://example.com/carrots.jpg", // optional
  "is_organic": true, // optional
  "is_featured": false // optional
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "product_id",
    "name": "Organic Carrots",
    "description": "Fresh organic carrots",
    "price": 3.99,
    "unit": "bunch",
    "stock_quantity": 50,
    "image": "https://example.com/carrots.jpg",
    "is_organic": true,
    "is_featured": false,
    "farmer_id": "farmer_id",
    "category_id": "category_id",
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
}
```

### Orders

#### Create Order

```
POST /api/orders
```

Create a new order.

**Request Body:**

```json
{
  "items": [
    {
      "product_id": "product_id",
      "quantity": 2
    },
    {
      "product_id": "another_product_id",
      "quantity": 1
    }
  ],
  "shipping_address_id": "address_id",
  "notes": "Please leave at the front door" // optional
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "status": "pending",
    "total_amount": 14.97,
    "shipping_fee": 5.99,
    "tax_amount": 1.20,
    "notes": "Please leave at the front door",
    "shipping_address_id": "address_id",
    "user_id": "user_id",
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z",
    "items": [
      {
        "product_id": "product_id",
        "quantity": 2,
        "unit_price": 3.99,
        "total_price": 7.98
      },
      {
        "product_id": "another_product_id",
        "quantity": 1,
        "unit_price": 5.99,
        "total_price": 5.99
      }
    ]
  }
}
```

#### Get User Orders

```
GET /api/orders/my-orders
```

Get orders for the authenticated user.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)
- `status`: Filter by order status (optional)
- `sort_by`: Field to sort by (default: created_at)
- `order`: Sort order, 'asc' or 'desc' (default: desc)

**Response:**

```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  },
  "data": [
    {
      "id": "order_id",
      "status": "processing",
      "total_amount": 14.97,
      "shipping_fee": 5.99,
      "tax_amount": 1.20,
      "notes": "Please leave at the front door",
      "tracking_number": null,
      "created_at": "2023-06-01T12:00:00Z",
      "updated_at": "2023-06-01T12:00:00Z",
      "shipping_address": {
        "id": "address_id",
        "name": "Home",
        "street_address": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "postal_code": "12345",
        "country": "USA"
      },
      "items": [
        {
          "id": "order_item_id",
          "product_id": "product_id",
          "quantity": 2,
          "unit_price": 3.99,
          "total_price": 7.98,
          "product": {
            "id": "product_id",
            "name": "Organic Carrots",
            "image": "https://example.com/carrots.jpg",
            "farmer_id": "farmer_id"
          }
        }
        // More items...
      ]
    }
    // More orders...
  ]
}
```

### Payments

#### Create Payment Intent

```
POST /api/payments/create-payment-intent
```

Create a payment intent for Stripe.

**Request Body:**

```json
{
  "order_id": "order_id"
}
```

**Response:**

```json
{
  "success": true,
  "clientSecret": "stripe_client_secret",
  "paymentIntentId": "stripe_payment_intent_id"
}
```

### Users

#### Get User Addresses

```
GET /api/users/addresses
```

Get addresses for the authenticated user.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "address_id",
      "name": "Home",
      "street_address": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "postal_code": "12345",
      "country": "USA",
      "is_default": true,
      "created_at": "2023-06-01T12:00:00Z",
      "updated_at": "2023-06-01T12:00:00Z"
    }
    // More addresses...
  ]
}
```

#### Add Address

```
POST /api/users/addresses
```

Add a new address for the authenticated user.

**Request Body:**

```json
{
  "name": "Work",
  "street_address": "456 Office Blvd",
  "city": "Worktown",
  "state": "CA",
  "postal_code": "54321",
  "country": "USA",
  "is_default": false // optional
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "address_id",
    "name": "Work",
    "street_address": "456 Office Blvd",
    "city": "Worktown",
    "state": "CA",
    "postal_code": "54321",
    "country": "USA",
    "is_default": false,
    "user_id": "user_id",
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse and ensure fair usage of resources. The rate limiting system has several components:

### IP-Based Rate Limiting

Different endpoints have different rate limits based on their sensitivity and expected usage:

- **Default Rate Limit**: 100 requests per minute for most API endpoints
- **Strict Rate Limit**: 20 requests per minute for authentication endpoints (login, register, etc.)
- **Relaxed Rate Limit**: 300 requests per minute for public endpoints (product listings, etc.)

### API Key-Based Rate Limiting

For applications that need higher rate limits, we offer API key-based rate limiting with different tiers:

- **Basic Tier**: 100 requests per minute (default for all API keys)
- **Premium Tier**: 300 requests per minute
- **Enterprise Tier**: 1000 requests per minute

To use API key-based rate limiting, include your API key in the `X-API-Key` header with your requests:

```
X-API-Key: your_api_key_here
```

Contact our support team to obtain an API key and learn about upgrading to higher tiers.

### Rate Limit Responses

If you exceed the rate limits, you'll receive a `429 Too Many Requests` response with the following format:

```json
{
  "success": false,
  "error": {
    "message": "Too many requests, please try again later."
  }
}
```

### Rate Limit Headers

The API includes the following rate limit headers in all responses:

- `RateLimit-Limit`: The maximum number of requests allowed in the window
- `RateLimit-Remaining`: The number of requests remaining in the current window
- `RateLimit-Reset`: The time when the current rate limit window resets in UTC epoch seconds

You can use these headers to implement proper rate limit handling in your client applications.

### Distributed Rate Limiting

Our rate limiting system uses Redis for distributed rate limiting, ensuring consistent rate limit enforcement across all API servers in our cluster.

### Whitelisting

Some IP addresses and API keys may be whitelisted and exempt from rate limiting. This is typically used for internal services and trusted partners. Contact our support team if you believe your application should be whitelisted.

## Caching System

The API implements a comprehensive caching system to improve performance and reduce database load. The caching system has several components:

### Server-Side Caching

The API uses a two-level caching strategy:

1. **In-memory cache**: Used by default in development environments
2. **Redis-based distributed cache**: Used in production environments for consistent caching across multiple server instances

Cached resources include:
- Product listings
- Product details
- Featured products
- Category listings
- And other frequently accessed resources

### Cache Invalidation

The cache is automatically invalidated when resources are modified:
- When a product is created, updated, or deleted
- When a category is modified
- When a farmer updates their profile

### HTTP Caching

The API also sets appropriate cache control headers for different types of resources:
- Static assets: Cached for 1 day (86400 seconds)
- Public API responses: Cached for 5 minutes (300 seconds)
- Authenticated routes: No caching (Cache-Control: no-store)

### Cache Headers

The API includes the following cache-related headers in responses:
- `Cache-Control`: Specifies caching directives
- `Vary`: Indicates how to match future request headers to decide whether a cached response can be used
- `Expires`: Provides a date/time after which the response is considered stale

Client applications should respect these headers to implement proper caching behavior.
