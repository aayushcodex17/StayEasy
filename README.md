# StayEase - Hotel Booking Platform

> A production-ready REST API backend for a hotel booking platform, built with Java 21, Spring Boot 3, and PostgreSQL.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Dynamic Pricing Strategies](#dynamic-pricing-strategies)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

**StayEase** is a full-featured backend service that replicates core functionalities of a hotel/vacation rental booking platform like Airbnb. Built using Java 21 and Spring Boot 3, it demonstrates real-world backend engineering — covering JWT-secured role-based APIs, dynamic pricing engine, Stripe payment integration, inventory management, and scheduled pricing updates.

---

## Architecture

```
Client Request
      │
      ▼
 JWTAuthFilter  ──────────────────────────────────────────
      │                                                    │
      ▼                                                    ▼
 Controller Layer                              WebSecurityConfig
 (REST Endpoints)                            (Role-based Access)
      │
      ▼
 Service Layer
 (Business Logic)
      │
      ├──► PricingService (Strategy Pattern)
      │         ├── BasePricingStrategy
      │         ├── SurgePricingStrategy
      │         ├── OccupancyPricingStrategy
      │         ├── UrgencyPricingStrategy
      │         └── HolidayPricingStrategy
      │
      ├──► CheckoutService (Stripe Integration)
      │
      └──► Repository Layer (Spring Data JPA)
                │
                ▼
          PostgreSQL Database
```

---

## Features

- **JWT Authentication** — Stateless login, token refresh, and role-based access control (`GUEST`, `HOTEL_MANAGER`)
- **Hotel & Room Management** — Full CRUD for hotels and rooms (admin only)
- **Inventory Management** — Per-day room availability tracking with bulk update support
- **Dynamic Pricing Engine** — 5 composable pricing strategies applied via Strategy Pattern
- **Booking System** — End-to-end reservation flow with guest management
- **Stripe Payment Integration** — Checkout session creation and webhook handling for payment events
- **Scheduled Pricing Updates** — Automatic price recalculation via `@Scheduled` jobs
- **Global Exception Handling** — Consistent API error responses (400, 401, 403, 404, 500)
- **Input Validation** — Bean Validation with custom `@ValidPassword` annotation
- **API Documentation** — Swagger UI via SpringDoc OpenAPI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.4.4 |
| Security | Spring Security + JWT (jjwt 0.12.6) |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Payments | Stripe Java SDK 29.2.0 |
| Mapping | ModelMapper 3.2.2 |
| Build Tool | Maven |
| Boilerplate | Lombok |
| API Docs | SpringDoc OpenAPI 2.8.8 |

---

## Project Structure

```
src/main/java/com/ayushcodex/stayease/
├── controllers/
│   ├── AuthController.java              # Signup, login, token refresh
│   ├── HotelController.java             # Admin hotel CRUD + reports
│   ├── HotelBrowseController.java       # Public hotel search
│   ├── HotelBookingController.java      # Booking flow
│   ├── RoomAdminController.java         # Admin room CRUD
│   ├── InventoryController.java         # Inventory management
│   ├── UserController.java              # User profile & bookings
│   └── WebhookController.java           # Stripe webhook events
├── services/
│   ├── impl/
│   │   ├── BookingServiceImpl.java
│   │   ├── HotelServiceImpl.java
│   │   ├── RoomServiceImpl.java
│   │   ├── InventoryServiceImpl.java
│   │   ├── UserServiceImpl.java
│   │   ├── CheckoutServiceImpl.java     # Stripe checkout
│   │   └── PricingUpdateService.java    # Scheduled pricing job
│   └── [interfaces]
├── strategy/
│   ├── PricingStrategy.java             # Interface
│   ├── BasePricingStrategy.java
│   ├── SurgePriceStrategy.java
│   ├── OccupancyPricingStrategy.java
│   ├── UrgencyPricingStrategy.java
│   └── HolidayPricingStrategy.java
├── entity/
│   ├── Hotel.java, Room.java
│   ├── Booking.java, Guest.java
│   ├── Inventory.java, HotelMinPrice.java
│   ├── User.java, Payment.java
│   └── enums/ (Role, BookingStatus, PaymentStatus, Gender)
├── security/
│   ├── JWTService.java
│   ├── JWTAuthFilter.java
│   ├── AuthService.java
│   └── WebSecurityConfig.java
├── dto/                                 # Request/Response DTOs
├── repositories/                        # Spring Data JPA repositories
├── advices/                             # Global exception handler + response wrapper
├── annotation/                          # @ValidPassword custom annotation
├── config/                              # ModelMapper, PasswordEncoder, Stripe config
├── exception/                           # Custom exceptions
└── util/                                # Utility classes
```

---

## API Reference

Base URL: `http://localhost:8081/api/v1`

### Auth — `/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Register as guest |
| POST | `/auth/login` | Public | Login and get JWT |
| POST | `/auth/registerAsHotelManager` | Public | Register as hotel manager |
| POST | `/auth/refresh` | Public | Refresh access token |

### Hotel Browse — `/hotels`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/hotels/search` | Public | Search hotels by location, dates, guests |
| GET | `/hotels/{hotelId}` | Public | Get hotel details |

### Admin Hotels — `/admin/hotels`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/admin/hotels` | HOTEL_MANAGER | Create hotel |
| GET | `/admin/hotels` | HOTEL_MANAGER | List my hotels |
| GET | `/admin/hotels/{hotelId}` | HOTEL_MANAGER | Get hotel |
| PUT | `/admin/hotels/{hotelId}` | HOTEL_MANAGER | Update hotel |
| DELETE | `/admin/hotels/{hotelId}` | HOTEL_MANAGER | Delete hotel |
| PATCH | `/admin/hotels/{hotelId}` | HOTEL_MANAGER | Activate hotel |
| GET | `/admin/hotels/{hotelId}/bookings` | HOTEL_MANAGER | View all bookings |
| GET | `/admin/hotels/{hotelId}/reports` | HOTEL_MANAGER | Revenue report |

### Admin Rooms — `/admin/hotels/{hotelId}/rooms`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/admin/hotels/{hotelId}/rooms` | HOTEL_MANAGER | Add room |
| GET | `/admin/hotels/{hotelId}/rooms` | HOTEL_MANAGER | List rooms |
| GET | `/admin/hotels/{hotelId}/rooms/{roomId}` | HOTEL_MANAGER | Get room |
| PUT | `/admin/hotels/{hotelId}/rooms/{roomId}` | HOTEL_MANAGER | Update room |
| DELETE | `/admin/hotels/{hotelId}/rooms/{roomId}` | HOTEL_MANAGER | Delete room |

### Admin Inventory — `/admin/inventory`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/inventory/rooms/{roomId}` | HOTEL_MANAGER | View inventory |
| PATCH | `/admin/inventory/rooms/{roomId}` | HOTEL_MANAGER | Update pricing/availability |

### Bookings — `/bookings`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/bookings` | Authenticated | Initiate booking |
| POST | `/bookings/{bookingId}/addGuests` | Authenticated | Add guests |
| POST | `/bookings/{bookingId}/payments` | Authenticated | Create payment session |
| POST | `/bookings/{bookingId}/cancel` | Authenticated | Cancel booking |
| POST | `/bookings/{bookingId}/status` | Authenticated | Get booking status |

### Users — `/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users/profile` | Authenticated | View profile |
| PATCH | `/users/profile` | Authenticated | Update profile |
| GET | `/users/myBookings` | Authenticated | View my bookings |

### Webhooks — `/webhook`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/webhook/payment` | Stripe | Handle payment events |

---

## Dynamic Pricing Strategies

StayEase uses a **composable Strategy Pattern** for pricing. Multiple strategies stack on top of each other:

| Strategy | Trigger | Effect |
|---|---|---|
| `BasePricingStrategy` | Always | Applies the room's base price |
| `SurgePricingStrategy` | High demand periods | Multiplies price during peak times |
| `OccupancyPricingStrategy` | Room occupancy > threshold | Increases price as availability drops |
| `UrgencyPricingStrategy` | Booking close to check-in date | Last-minute price adjustment |
| `HolidayPricingStrategy` | Public holidays / weekends | Holiday surcharge applied |

Prices are automatically recalculated on a schedule via `PricingUpdateService`.

---

## Getting Started

### Prerequisites

- Java JDK 21+
- Maven 3.8+
- PostgreSQL 14+
- Stripe account (for payment features)

### Installation

```bash
# Clone the repository
git clone https://github.com/aayushcodex17/StayEasy.git

# Navigate into the project directory
cd StayEasy

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The server starts at: `http://localhost:8081/api/v1`

Swagger UI: `http://localhost:8081/api/v1/swagger-ui/index.html`

---

## Environment Variables

Configure the following in `src/main/resources/application.properties`:

```properties
# Server
spring.application.name=StayEase
server.port=8081
server.servlet.context-path=/api/v1

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/stayease
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT
jwt.secretKey=YOUR_JWT_SECRET_KEY

# Stripe
stripe.secret.key=YOUR_STRIPE_SECRET_KEY
stripe.webhook.secret=YOUR_STRIPE_WEBHOOK_SECRET

# Frontend
frontend.url=http://localhost:3000
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
