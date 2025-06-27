![MIT License](https://img.shields.io/badge/license-MIT-green)

# Banking Event Driven System Centralized With API Gateway

This project is a **modular and event driven backend system** for managing user accounts, transactions, and notifications in a banking domain. It’s structured using **microservices principles** with a clear separation of responsibilities, **Kafka for async messaging**, and **MongoDB replica sets** for reliable transaction handling. A centralized **API Gateway** which orchestrates and secures all external client interactions.

## Architecture Overview

The system is split into independently running services to promote **loose coupling**, **scalability**, and **separation of concerns**:

* **API Gateway** – Serves as the single entry point for all external requests. It handles route proxying, request validation, auth forwarding, global error formatting, and response transformation. It also applies centralized logging and monitoring via NestJS interceptors.

* **User Service** – Handles user registration, authentication (JWT via cookies), and user metadata exposure.

* **Banking Service** – A composite service with:

  * **Account Module** – Responsible for creating accounts, checking balances, freezing/unfreezing, changing account type, and admin level operations.
  * **Transaction Module** – Manages user initiated transfers with proper balance checks and transaction consistency using MongoDB sessions.

* **Notification Worker** – A Kafka consumer that listens to transaction related events and handles system notifications or alerts.

## Tech Stack

* **Backend Framework:** Node.js (with NestJS structure)
* **API Gateway:** NestJS + HTTP Proxy + Global Interceptors & Exception Filters
* **Database:** MongoDB with Replica Set enabled (for transaction support)
* **Authentication:** JWT via HttpOnly cookies
* **Message Broker:** Apache Kafka (`kafkajs`)
* **Architecture:** Microservices
* **Logging:** Winston (centralized logs via API Gateway)
* **Communication:** Internal HTTP calls + Kafka events

## Event-Driven Communication with Kafka

Each domain emits or consumes Kafka events for asynchronous workflows. This keeps services loosely coupled while ensuring real time updates.

**Event Topics Include:**

* `TransactionCompleted` ➝ emitted after a successful transaction
* `TransactionFailed` ➝ emitted when a transaction is aborted due to user issues (e.g., insufficient funds)
* `AccountFundedPayload` ➝ emitted when an account is externally credited

These events are consumed by the **Notification Worker**, which handles downstream tasks like logging or alert delivery.

## Microservices Responsibilities

### API Gateway

* Unifies route access to all downstream services
* Applies global **logging** and **transform interceptors**
* Integrates a custom **global exception filter** to standardize error responses, including propagated `AxiosError` from service failures (e.g., "Email already exists" from the User Service)
* Forwards user authentication headers (JWT) to downstream services
* Enforces RBAC by applying global and route level **Guards**

### User Service

* Register/login users with secure cookie-based JWT
* Verifies user sessions across services
* Exposes user data through an internal HTTP endpoint (`fetchUserById`)

### Banking Service

Contains two fully independent but related domains:

#### Account Module

* Create and fetch bank accounts
* Admin level access to:
* Freeze or unfreeze accounts
* Exposes balance and account info
* Supports RBAC (Admin vs User access)

#### Transaction Module

* Transfers funds between accounts with balance checks
* Uses MongoDB **replica set transactions**
* Ensures sender is the authorized user
* Publishes Kafka events based on the result (`TransactionCompleted`, `TransactionFailed`)
* Enriches transaction logs with sender/receiver and user data

### Notification Worker

* Kafka consumer listening on all relevant topics
* Logs transaction success/failure
* Easily extensible for email, SMS, or push alerts in future

## Key Features & Engineering Principles

* **API Gateway with centralized access** for security, logging, error handling, and response formatting
* **Domain Isolation**: Banking and User responsibilities are kept modular and independent
* **DRY** code practices across services
* **SOLID** aligned services and controllers
* **MongoDB Replica Set** for true ACID transaction support
* **Kafka Messaging** ensures scalable and loosely coupled architecture
* **Secure Auth** with role based permissions and JWT in HttpOnly cookies
* **Interceptor Layering** for consistent logging and response shaping (via `LoggingInterceptor` and `TransformInterceptor`)
* **Global Exception Handling** with uniform structure even for downstream errors using Axios

## Getting Started

### Prerequisites

* Node.js
* MongoDB (with replica set enabled)
* Kafka + ZooKeeper (running locally or via Docker)

### Environment Variables

Ensure each service is configured with:

```
PORT=...
JWT_SECRET=...
MONGO_URI=...
KAFKA_BROKER=...
```

### Installation & Running

Clone the repository and install dependencies in each service folder:

```bash
# API Gateway
cd "api gateway"
npm install
npm run start:dev

# User Service
cd "user service"
npm install
npm run start:dev

# Banking Service (Account + Transaction modules)
cd "banking service"
npm install
npm run start:dev

# Notification Worker (Kafka consumer)
cd "notification worker"
npm install
npm run start:dev
```

MongoDB replica set and Kafka must be running beforehand.

## Sample Event Flow

```
User ➝ POST /transactions/transfer (via API Gateway)
  ➝ Authenticated via JWT Cookie
    ➝ Sender validated + balance checked
      ➝ Mongo Transaction committed
        ➝ Kafka Event: TransactionCompleted
          ➝ Notification Worker logs transaction success
```

```
Admin ➝ PATCH /accounts/:id/freeze (via API Gateway)
  ➝ Verifies admin role via API Gateway Guard
    ➝ Request proxied with auth headers to Account Service
      ➝ Account status updated and returned via standardized API response
```

## Future Improvements

* Add **Swagger API documentation** for all endpoints
* Add **gRPC** or GraphQL for internal service communication
* Extend **Redis** for caching user/account lookups
* Extend **Notification Worker** to send real-time emails or SMS alerts

## Acknowledgements

Built to demonstrate clear understanding of domain based service isolation, message driven workflows using Kafka, secure transaction flows, and centralized routing/security via an API Gateway.

## License

This project is licensed under the MIT License
