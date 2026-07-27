# GKMart Backend API

Backend server for GKMart built with Node.js, Express, and MongoDB.

## Features

- ✓ User Authentication (JWT-based)
- ✓ Signup with name, email, phone number, and password
- ✓ Login with email or phone number
- ✓ Layered Architecture (Routes → Controllers → Services → Repositories → Models)
- ✓ MongoDB integration with Mongoose ODM
- ✓ Input validation with Joi
- ✓ Error handling middleware
- ✓ CORS support

## Prerequisites

- Node.js 18+ 
- npm 9+
- MongoDB 4.4+ (local or remote)

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and update the values:

```
MONGODB_URI=mongodb://localhost:27017/gkmart
PORT=3001
NODE_ENV=development
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=157680000
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or manually
mongod --dbpath /path/to/data
```

**Option B: MongoDB Atlas (Cloud)**
Update `MONGODB_URI` in `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gkmart
```

## Running the Server

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Production Mode

```bash
npm run build
npm start
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### 1. Signup
Create a new user account.

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "9876543210",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "number": "9876543210"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400 | 409):**
```json
{
  "success": false,
  "message": "Email already registered",
  "errors": ["Email already registered"]
}
```

#### 2. Login
Login with email or phone number.

**Endpoint:** `POST /auth/login`

**Request Body (with email):**
```json
{
  "identifier": "john@example.com",
  "password": "password123"
}
```

**Request Body (with phone number):**
```json
{
  "identifier": "9876543210",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "number": "9876543210"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 | 400):**
```json
{
  "success": false,
  "message": "Invalid email/number or password"
}
```

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Using the JWT Token

Include the token in the `Authorization` header for authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection/disconnection
│   ├── controllers/
│   │   └── AuthController.ts    # Request handlers
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   └── errorHandler.ts      # Error handling
│   ├── models/
│   │   └── User.ts              # MongoDB User schema
│   ├── repositories/
│   │   └── UserRepository.ts    # Data access layer
│   ├── routes/
│   │   └── auth.ts              # API routes
│   ├── services/
│   │   └── AuthService.ts       # Business logic
│   ├── lib/
│   │   ├── jwt.ts               # JWT utilities
│   │   └── password.ts          # Password hashing utilities
│   ├── validators/
│   │   └── auth.ts              # Input validation schemas
│   └── index.ts                 # Express app entry point
├── .env                         # Environment variables (git ignored)
├── .env.example                 # Environment template
├── package.json                 # Dependencies
└── tsconfig.json               # TypeScript configuration
```

## Architecture

The backend follows a **layered architecture** pattern:

```
Routes (Express endpoints)
    ↓
Controllers (Request validation & response formatting)
    ↓
Services (Business logic)
    ↓
Repositories (Data access layer)
    ↓
Models (MongoDB schemas)
    ↓
Database (MongoDB)
```

### Benefits
- **Separation of concerns:** Each layer has a single responsibility
- **Testability:** Easy to mock and test individual layers
- **Reusability:** Services can be used by multiple controllers
- **Maintainability:** Changes in one layer don't affect others

## Validation Rules

### Signup
- **name:** Required, 2-100 characters
- **email:** Required, valid email format, must be unique
- **number:** Required, exactly 10 digits, must be unique
- **password:** Required, minimum 6 characters

### Login
- **identifier:** Required (email or phone number)
- **password:** Required

## Error Handling

The API uses standard HTTP status codes:

- **200 OK:** Successful request
- **201 Created:** Resource created successfully
- **400 Bad Request:** Validation error or missing required fields
- **401 Unauthorized:** Invalid credentials or token
- **404 Not Found:** Endpoint not found
- **409 Conflict:** Duplicate email/phone number
- **500 Internal Server Error:** Server error

## Development

### Build TypeScript
```bash
npm run build
```

### Environment Variables
See [.env.example](.env.example) for all available configurations.

## Future Enhancements

- [ ] Email verification on signup
- [ ] Password reset functionality
- [ ] Refresh token pattern
- [ ] Role-based access control (RBAC)
- [ ] Rate limiting
- [ ] API documentation with Swagger/OpenAPI
- [ ] Unit and integration tests
- [ ] CI/CD pipeline

## License

ISC
