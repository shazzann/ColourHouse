# API Documentation - Local Paint Connect Server

## Base URL
```
http://localhost:3001/api
```

## Authentication

All protected endpoints require an Authorization header with JWT token:
```
Authorization: Bearer <token>
```

Token is obtained from `/auth/signin` or `/auth/signup` endpoints.

---

## Authentication Endpoints

### Sign Up
Create a new user account.

**Endpoint:** `POST /auth/signup`

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
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Email already registered or validation error
- 500: Server error

---

### Sign In
Authenticate user and get JWT token.

**Endpoint:** `POST /auth/signin`

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
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid credentials
- 500: Server error

---

### Get Current Session
Get details of authenticated user.

**Endpoint:** `GET /auth/session`

**Headers Required:** Authorization Bearer Token

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "admin|user"
  },
  "session": {
    "access_token": "jwt-token"
  }
}
```

**Status Codes:**
- 200: Success
- 401: Invalid or missing token
- 404: User not found
- 500: Server error

---

## Products Endpoints

### Get Products
Get paginated list of products with optional filtering.

**Endpoint:** `GET /api/products`

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 12): Items per page
- `search` (optional): Search term (searches name, code, brand)
- `categories` (optional): JSON array of category IDs to filter by

**Examples:**
```
GET /api/products
GET /api/products?page=2&limit=20
GET /api/products?search=red
GET /api/products?categories=["cat1","cat2"]
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "Description",
      "price": 99.99,
      "code": "P123",
      "brand": "Brand Name",
      "images": "[\"path1\",\"path2\"]",
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:00:00Z"
    }
  ],
  "count": 100
}
```

**Status Codes:**
- 200: Success
- 500: Server error

---

### Get Single Product
Get details of a specific product.

**Endpoint:** `GET /api/products/:id`

**Response:**
```json
{
  "id": "uuid",
  "name": "Product Name",
  "description": "Description",
  "price": 99.99,
  "code": "P123",
  "brand": "Brand Name",
  "images": "[\"path1\",\"path2\"]",
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z"
}
```

**Status Codes:**
- 200: Success
- 404: Product not found
- 500: Server error

---

### Create Product
Create a new product (admin only).

**Endpoint:** `POST /api/products`

**Headers Required:** Authorization Bearer Token (Admin)

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "code": "P123",
  "brand": "Brand Name",
  "images": ["path/to/image1.jpg", "path/to/image2.jpg"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "code": "P123",
  "brand": "Brand Name",
  "images": ["path/to/image1.jpg", "path/to/image2.jpg"]
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated
- 403: Not admin
- 500: Server error

---

### Update Product
Update an existing product (admin only).

**Endpoint:** `PUT /api/products/:id`

**Headers Required:** Authorization Bearer Token (Admin)

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "price": 149.99,
  "code": "P456",
  "brand": "Updated Brand",
  "images": ["path/to/image1.jpg"]
}
```

**Response:** Same as Create Product

**Status Codes:**
- 200: Success
- 401: Not authenticated
- 403: Not admin
- 500: Server error

---

### Delete Product
Delete a product (admin only).

**Endpoint:** `DELETE /api/products/:id`

**Headers Required:** Authorization Bearer Token (Admin)

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated
- 403: Not admin
- 500: Server error

---

## Categories Endpoints

### Get Categories
Get all categories.

**Endpoint:** `GET /api/categories`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Category Name",
    "slug": "category-name",
    "created_at": "2025-01-01T10:00:00Z"
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

---

### Create Category
Create a new category (admin only).

**Endpoint:** `POST /api/categories`

**Headers Required:** Authorization Bearer Token (Admin)

**Request Body:**
```json
{
  "name": "Category Name"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Category Name",
  "slug": "category-name"
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated
- 403: Not admin
- 500: Server error

---

### Update Category
Update a category (admin only).

**Endpoint:** `PUT /api/categories/:id`

**Headers Required:** Authorization Bearer Token (Admin)

**Request Body:**
```json
{
  "name": "Updated Category Name"
}
```

**Response:** Same as Create Category

---

### Delete Category
Delete a category (admin only).

**Endpoint:** `DELETE /api/categories/:id`

**Headers Required:** Authorization Bearer Token (Admin)

**Response:**
```json
{
  "success": true
}
```

---

## Settings Endpoints

### Get Settings
Get application settings.

**Endpoint:** `GET /api/settings`

**Response:**
```json
{
  "id": "default",
  "whatsapp_number": "+1234567890",
  "store_name": "Paint Connect",
  "updated_at": "2025-01-01T10:00:00Z"
}
```

**Status Codes:**
- 200: Success
- 500: Server error

---

### Update Settings
Update application settings (admin only).

**Endpoint:** `PUT /api/settings`

**Headers Required:** Authorization Bearer Token (Admin)

**Request Body:**
```json
{
  "whatsapp_number": "+1234567890",
  "store_name": "Paint Connect"
}
```

**Response:** Same as Get Settings

---

## Messages Endpoints

### Create Contact Message
Submit a contact form message.

**Endpoint:** `POST /api/messages`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "I'm interested in your products"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "I'm interested in your products",
  "read": 0,
  "created_at": "2025-01-01T10:00:00Z"
}
```

**Status Codes:**
- 200: Success
- 400: Missing required fields
- 500: Server error

---

### Get Contact Messages
Get all contact messages (admin only).

**Endpoint:** `GET /api/messages`

**Headers Required:** Authorization Bearer Token (Admin)

**Query Parameters:**
- `limit` (default: 50): Number of messages to return
- `offset` (default: 0): Pagination offset

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "Message content",
    "read": 0,
    "created_at": "2025-01-01T10:00:00Z"
  }
]
```

---

### Mark Message as Read
Mark a contact message as read (admin only).

**Endpoint:** `PUT /api/messages/:id/read`

**Headers Required:** Authorization Bearer Token (Admin)

**Response:**
```json
{
  "success": true
}
```

---

### Delete Contact Message
Delete a contact message (admin only).

**Endpoint:** `DELETE /api/messages/:id`

**Headers Required:** Authorization Bearer Token (Admin)

**Response:**
```json
{
  "success": true
}
```

---

## Image Upload Endpoints

### Upload Image
Upload an image file.

**Endpoint:** `POST /uploads/upload`

**Headers Required:** Authorization Bearer Token

**Request Body:** FormData with file field
```
file: <image file>
```

**Response:**
```json
{
  "path": "/uploads/filename.jpg"
}
```

**Status Codes:**
- 200: Success
- 400: No file uploaded or invalid format
- 401: Not authenticated
- 500: Server error

---

### Get Image
Retrieve an uploaded image.

**Endpoint:** `GET /uploads/:filename`

**Response:** Image file (binary)

**Status Codes:**
- 200: Success
- 403: Access denied (directory traversal attempt)
- 404: File not found
- 500: Server error

---

### Delete Image
Delete an uploaded image.

**Endpoint:** `DELETE /uploads/:filename`

**Headers Required:** Authorization Bearer Token

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated
- 403: Access denied
- 404: File not found
- 500: Server error

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

## Common Status Codes

- **200** - OK: Request successful
- **400** - Bad Request: Invalid input or missing required fields
- **401** - Unauthorized: Missing or invalid authentication token
- **403** - Forbidden: Authenticated but don't have permission (e.g., not admin)
- **404** - Not Found: Resource doesn't exist
- **500** - Server Error: Internal server error

## Testing

Use tools like Postman, Insomnia, or curl to test endpoints:

```bash
# Sign up
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get products
curl http://localhost:3001/api/products

# Get settings
curl http://localhost:3001/api/settings
```
