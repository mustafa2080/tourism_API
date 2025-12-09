# Storck Tours API

A production-ready Node.js REST API for a travel company built with Express.js, Prisma, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (User, Admin, Support)
  - Password reset via email

- **Trip Management**
  - Full CRUD operations for trips
  - Image management with cloud storage support
  - Publish/unpublish workflows
  - Search & filtering (destination, price, duration, tags)

- **Booking System**
  - Complete booking lifecycle (create, confirm, cancel)
  - Seat availability management
  - Booking references

- **Reviews & Ratings**
  - User reviews with moderation
  - Rating system (1-5 stars)
  - Flagging for inappropriate content

- **Favorites/Wishlist**
  - Add/remove trips to favorites

- **Admin Dashboard**
  - Statistics and metrics
  - User management
  - Audit logging

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── config/            # Configuration
│   │   ├── index.js       # Environment config
│   │   └── database.js    # Prisma client
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Express middlewares
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── validators/        # Request validators
│   └── app.js             # Express app setup
├── .env                   # Environment variables
├── .env.example           # Example env file
├── server.js              # Entry point
└── package.json
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 🚀 Getting Started

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user |
| PUT | `/api/v1/users/me` | Update profile |
| PUT | `/api/v1/users/me/password` | Change password |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/trips` | List trips (with filters) |
| POST | `/api/v1/trips` | Create trip (Admin) |
| GET | `/api/v1/trips/:id` | Get trip details |
| PUT | `/api/v1/trips/:id` | Update trip (Admin) |
| DELETE | `/api/v1/trips/:id` | Delete trip (Admin) |
| POST | `/api/v1/trips/:id/publish` | Publish trip (Admin) |
| GET | `/api/v1/trips/:id/availability` | Check availability |
| GET | `/api/v1/trips/:id/images` | Get trip images |
| POST | `/api/v1/trips/:id/images` | Add image (Admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/bookings` | List user's bookings |
| POST | `/api/v1/trips/:id/bookings` | Create booking |
| GET | `/api/v1/bookings/:id` | Get booking details |
| PUT | `/api/v1/bookings/:id/cancel` | Cancel booking |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/trips/:id/reviews` | Get trip reviews |
| POST | `/api/v1/trips/:id/reviews` | Add review |
| PUT | `/api/v1/reviews/:id` | Update review |
| DELETE | `/api/v1/reviews/:id` | Delete review |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/favorites` | List favorites |
| POST | `/api/v1/favorites` | Add to favorites |
| DELETE | `/api/v1/favorites/:id` | Remove from favorites |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search` | Search trips |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard/stats` | Dashboard stats |
| GET | `/api/v1/admin/users` | List users |
| GET | `/api/v1/admin/trips` | List all trips |
| GET | `/api/v1/admin/bookings` | List all bookings |
| GET | `/api/v1/admin/reviews` | List all reviews |
| GET | `/api/v1/admin/audit-logs` | View audit logs |

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Access Token**: Short-lived (15 min), sent in `Authorization: Bearer <token>` header
2. **Refresh Token**: Long-lived (7 days), stored as httpOnly cookie

## 📝 Response Format

All responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": [ ... ]
  }
}
```

## 🧪 Testing

```bash
# Run tests
npm test
```

## 📦 Production Build

```bash
# Start production server
npm start
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 5000 |
| `DATABASE_URL` | PostgreSQL URL | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | Token expiry | 15m |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh expiry | 7d |
| `CORS_ORIGIN` | Allowed origins | http://localhost:3000 |

## 📄 License

ISC

## 👥 Authors

Storck Tours Development Team
