# Product Requirements Document (PRD)

## Project

**Backend for Storck Tours** — Node.js REST API for a travel company

## Overview

This project delivers a production-ready backend API for a travel company. It covers full authentication and authorization, trip management, trip details and images, reviews & comments, booking lifecycle (create, confirm, cancel), search, favorites, admin dashboard functionality, and core features expected in a modern travel site.

## Goals

* Provide secure user authentication (email/password + JWT + refresh tokens).
* Enable full CRUD for trips, images, reviews and bookings.
* Support searching and filtering trips by multiple parameters (date, price, destination, duration, tags).
* Provide admin endpoints and dashboards for managing users, trips, bookings and reviews.
* Track metrics and support pagination, validation, and robust error handling.

## Success metrics

* API uptime & availability >= 99.5% after deployment
* Average response time < 300ms for most read endpoints
* 95% of endpoints covered by unit/integration tests
* Secure authentication, no critical vulnerabilities on audit

## Personas

* **Traveler (end user):** Browses trips, favorites, books and leaves reviews.
* **Admin / Operator:** Creates and manages trips, images, reviews moderation, manages bookings.
* **Support Agent:** Access to booking info and user contact for customer support.

## Non-goals

* Payment gateway implementation (the API will support payment integration hooks but not process payments itself).
* Full CMS for marketing pages (only trip content and images managed here).

## Assumptions

* Images will be stored in cloud object storage (S3-compatible) and served via signed URLs or CDN.
* The system will use a relational DB (Postgres) for core data and Redis for caching/sessions/rate-limit counters.
* Authentication uses JWT for API access and refresh tokens stored server-side or as httpOnly cookies.

## Tech stack (recommended)

* Node.js (LTS) + Express or Fastify
* PostgreSQL (Prisma or TypeORM/Sequelize)
* Redis for caching and rate-limiting
* Cloud storage (S3 or equivalent) for images
* Docker + Kubernetes for deployment

## Data models (high level)

* **User**: id, name, email, phone, passwordHash, role (user/admin/support), profilePhoto, createdAt, updatedAt
* **Trip**: id, title, slug, description, itinerary, price, currency, durationDays, startDate(s), endDate(s), destinations, tags, seatsAvailable, totalSeats, occupancyPolicy, status (draft/published/archived), createdBy, createdAt, updatedAt
* **TripImage**: id, tripId, url, altText, order
* **Booking**: id, tripId, userId, status (pending/confirmed/cancelled/refunded), passengers (array), totalPrice, paymentStatus, bookingReference, createdAt, updatedAt, cancelledAt
* **Review**: id, tripId, userId, rating (1-5), title, comment, status (published/hidden/flagged), createdAt
* **Favorite**: id, userId, tripId, createdAt
* **AuditLog**: id, actorId, action, targetType, targetId, metadata, timestamp

## Core features

1. Authentication & Authorization

   * Sign up, login, logout, refresh tokens, change password, forgot/reset password.
   * Role-based access control (User, Admin, Support).
2. Trip management

   * Create, read, update, delete trips (admins & operators).
   * Publish/unpublish flows and draft support.
   * Trip versions/history (optional).
3. Trip details & images

   * Upload images per trip, reorder, delete.
   * Serve images via signed URLs and CDN-friendly endpoints.
4. Reviews & comments

   * Authenticated users can post reviews and comments on trips.
   * Moderation flow for admins (hide, remove, flag).
5. Booking lifecycle

   * Book a trip (with passenger details), check availability, hold seats, confirm booking.
   * Cancel booking (with cancellation policy enforcement), partial refunds handled externally.
   * Booking statuses and history.
6. Search & filtering

   * Full-text search over title/description/itinerary.
   * Filters: destination, price range, date range, duration, rating, tags.
   * Sorting: price, newest, popularity, rating.
7. Favorites / Wishlist

   * Users can add/remove trips to favorites.
8. Admin dashboard APIs

   * Summaries: bookings by date, revenue (if integrated), active trips, top-rated trips, flagged reviews.
   * CRUD for users, trips, reviews, bookings.
9. Notifications & emails

   * Booking confirmation, reminders, cancellation notices via email worker (async jobs).
10. Auditing, Logging & Monitoring

* Audit logs for admin actions, structured logs for requests, error tracking (Sentry)

11. Rate limiting & security

* Per-IP and per-user rate limiting. Input validation, sanitization, CSRF protections for cookie flows.

## Non-functional requirements

* Security: enforce OWASP best practices, hashed passwords (bcrypt/argon2), secure JWT handling.
* Performance: caching warm responses (Redis), DB indexes on common filters.
* Scalability: stateless API servers, use queues for heavy tasks (image processing, emails).
* Observability: structured logs + metrics (Prometheus) + tracing.

---

## API Design: Conventions

* Base path: `/api/v1`
* Authentication: JWT Bearer token in `Authorization: Bearer <token>` or httpOnly cookie for web clients.
* Responses: JSON, envelope `{ success: boolean, data: ..., error: ... }`.
* Pagination: standard `?page=1&limit=20` and `X-Total-Count` header.
* Validation errors: 400 with details.
* Rate limit responses: 429.

---

## API Endpoints (complete list)

> Authentication & user management

* `POST /api/v1/auth/register` — Public. Register new user. Body: `{ name, email, password, phone? }`.
* `POST /api/v1/auth/login` — Public. Login and return access + refresh tokens. Body: `{ email, password }`.
* `POST /api/v1/auth/logout` — Auth required. Invalidate refresh token.
* `POST /api/v1/auth/refresh` — Public (send refresh token). Returns new access token.
* `POST /api/v1/auth/forgot-password` — Public. Send reset email. Body: `{ email }`.
* `POST /api/v1/auth/reset-password` — Public. Reset using token. Body: `{ token, newPassword }`.
* `GET /api/v1/users/me` — Auth required. Return current user profile.
* `PUT /api/v1/users/me` — Auth required. Update profile fields.
* `PUT /api/v1/users/me/password` — Auth required. Change password. Body: `{ currentPassword, newPassword }`.
* `GET /api/v1/users/:id` — Admin only. Get user by id.
* `PUT /api/v1/users/:id` — Admin only. Update user (role, status).
* `DELETE /api/v1/users/:id` — Admin only. Soft-delete a user.

> Trips

* `GET /api/v1/trips` — Public. List trips with query filters. Query params: `page, limit, q, destination, startDate, endDate, priceMin, priceMax, durationMin, durationMax, tags, sort`.
* `POST /api/v1/trips` — Admin/Operator. Create new trip. Body: trip fields.
* `GET /api/v1/trips/:tripId` — Public. Get trip details including images, average rating, availability summary.
* `PUT /api/v1/trips/:tripId` — Admin/Operator. Update trip.
* `DELETE /api/v1/trips/:tripId` — Admin/Operator. Delete (soft) trip.
* `POST /api/v1/trips/:tripId/publish` — Admin. Publish a draft.
* `POST /api/v1/trips/:tripId/unpublish` — Admin.
* `GET /api/v1/trips/:tripId/availability` — Public. Check seats availability and upcoming dates.
* `GET /api/v1/trips/:tripId/itinerary` — Public. Full itinerary content.

> Trip images

* `POST /api/v1/trips/:tripId/images` — Admin. Upload image (multipart/form-data). Response returns image metadata and CDN URL or signed upload URL.
* `GET /api/v1/trips/:tripId/images` — Public. List images for trip.
* `PUT /api/v1/trips/:tripId/images/:imageId` — Admin. Update image metadata (altText, order).
* `DELETE /api/v1/trips/:tripId/images/:imageId` — Admin. Remove image.

> Reviews & comments

* `GET /api/v1/trips/:tripId/reviews` — Public. Paginated list of reviews for a trip.
* `POST /api/v1/trips/:tripId/reviews` — Auth required. Create a review. Body: `{ rating, title?, comment }`.
* `GET /api/v1/reviews/:reviewId` — Public. Get single review.
* `PUT /api/v1/reviews/:reviewId` — Auth required (owner) or Admin. Edit review.
* `DELETE /api/v1/reviews/:reviewId` — Auth required (owner) or Admin. Delete review (soft).
* `POST /api/v1/reviews/:reviewId/flag` — Auth required. Flag a review for moderation.
* `GET /api/v1/admin/reviews` — Admin. List reviews (with filters for flagged/hidden).
* `PUT /api/v1/admin/reviews/:reviewId/moderate` — Admin. Change review status (publish/hide/remove).

> Bookings

* `POST /api/v1/trips/:tripId/bookings` — Auth required. Create booking. Body: `{ passengers: [...], date, options, paymentInfoRef? }`.
* `GET /api/v1/bookings` — Auth required. List bookings for current user (admins can filter by user or trip).
* `GET /api/v1/bookings/:bookingId` — Auth required. Get booking details (only owner or admin).
* `PUT /api/v1/bookings/:bookingId/cancel` — Auth required. Request cancellation. Body: `{ reason? }`.
* `POST /api/v1/bookings/:bookingId/confirm` — Admin or payment worker. Confirm booking after payment.
* `PUT /api/v1/bookings/:bookingId` — Auth required. Update booking (limited fields before confirmation).
* `DELETE /api/v1/bookings/:bookingId` — Admin. Hard-delete (rare).
* `GET /api/v1/admin/bookings` — Admin. List & filter bookings for dashboard.

> Favorites / Wishlist

* `GET /api/v1/favorites` — Auth required. List user's favorite trips.
* `POST /api/v1/favorites` — Auth required. Body: `{ tripId }`.
* `DELETE /api/v1/favorites/:favoriteId` — Auth required. Remove from favorites.
* `DELETE /api/v1/favorites/trip/:tripId` — Auth required. Remove by trip ID.

> Search

* `GET /api/v1/search` — Public. General search endpoint. Query: `q, destination, tags, startDate, endDate, priceMin, priceMax, durationMin, durationMax, ratingMin, sort, page, limit`.

> Admin / Dashboard

* `GET /api/v1/admin/dashboard/stats` — Admin. Overview metrics: totalUsers, totalBookings, revenueEstimate, topTrips, bookingsByDay.
* `GET /api/v1/admin/users` — Admin. List users with filters.
* `GET /api/v1/admin/trips` — Admin. List trips with moderation filters.
* `GET /api/v1/admin/bookings` — Admin. List and export bookings.
* `PUT /api/v1/admin/trips/:tripId/override-availability` — Admin. Force-set availability/seat counts.
* `POST /api/v1/admin/maintenance/reindex` — Admin. Trigger search index rebuild (background job).

> Utilities

* `GET /api/v1/health` — Public/internal. Health check endpoint.
* `GET /api/v1/metadata/currencies` — Public. Supported currencies.
* `GET /api/v1/metadata/destinations` — Public. Destinations & categories.

> Media & Upload helpers

* `POST /api/v1/uploads/url` — Auth required (admin). Request a signed upload URL for direct-to-storage uploads. Body: `{ filename, contentType, tripId? }`.
* `POST /api/v1/uploads/callback` — Internal. Storage provider calls back after upload to confirm and attach image record.

> Notifications & emails (async)

* `POST /api/v1/notifications/email/booking-confirmation` — Internal/worker. Trigger email (usually enqueued).

---

## Error codes (high level)

* `400` — Bad request / validation error
* `401` — Unauthorized
* `403` — Forbidden
* `404` — Not found
* `409` — Conflict (e.g., double booking)
* `429` — Rate limit
* `500` — Server error

## Security & privacy considerations

* Store password hashes with Argon2 or bcrypt and use per-user salts.
* Use HTTPS everywhere and secure cookies if used for web flows.
* Rate limit auth endpoints to prevent brute force.
* GDPR/CCPA: provide user data export & deletion endpoints (admin or user self-service).

## Testing & QA

* Unit tests for controllers/services and integration tests for DB-backed flows (bookings, availability).
* Contract tests for public endpoints.
* Load test trips listing and booking concurrency to avoid overselling seats.

## Monitoring & SLOs

* Track HTTP error rates, request latencies, request throughput, queue backlog.
* Alerts for 5xx spike, high latency, or failed background jobs.

## Deployment & infra notes

* Containerize service and deploy behind ingress with autoscaling rules.
* Use a managed Postgres instance and enable automated backups.
* Use CI pipeline for linting, tests, and security scanning.

## Migration & backward compatibility

* Version your API (`/api/v1`) and support graceful migration plans.
* Use DB migrations with descriptive steps and rollbacks.

## Appendix — Example request/response snippets

(Include in repo `docs/` as Postman or OpenAPI spec.)

---

*End of PRD*
