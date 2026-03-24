# Stock Management System

Inventory management API built with TypeScript, Node.js, Express, and MySQL. Manages stock creation, reservation, sale, return, and deletion through a RESTful interface.

## Tech Stack

- **Runtime**: Node.js 18+, TypeScript
- **Framework**: Express.js
- **Database**: MySQL 8.4 — connection pool, atomic transactions with `SELECT FOR UPDATE`
- **Driver**: mysql2 with prepared statements (SQL injection safe)
- **Documentation**: TSOA + Swagger UI (auto-generated)
- **Tests**: Jest, ts-jest — unit + e2e with real MySQL via Docker
- **Quality**: ESLint, Prettier
- **Container**: Docker Compose

## Prerequisites

- Node.js >= 18
- npm >= 8
- Docker + Docker Compose

## Setup

### 1. Clone and install
```bash
git clone https://github.com/luizcurti/stock-management-system.git
cd stock-management-system
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Default values work for local development
```

### 3. Start the database
```bash
docker-compose up -d
```

### 4. Run the application

```bash
# Development (hot reload)
npm run dev

# Production
npm run build && npm start
```

API available at `http://localhost:3000`.

## API Reference

Interactive docs at `http://localhost:3000/docs` (requires build).

A ready-to-use Insomnia collection is included at `Insomnia.json`.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/product/:id/stock` | Create or update stock for a product |
| `GET` | `/product/:id` | Get stock summary (available, reserved, sold) |
| `POST` | `/product/:id/reserve` | Reserve 1 unit — returns a UUID token |
| `POST` | `/product/:id/sold` | Confirm sale using reservation token |
| `POST` | `/product/:id/return` | Return reserved unit back to stock |
| `DELETE` | `/product/:id` | Delete product (only if no reservations or sales history) |
| `GET` | `/health` | Health check |

### Request / Response examples

#### Create or update stock
```http
PATCH /product/5/stock
Content-Type: application/json

{ "product": "Volleyball", "qtd": 50 }
```
```json
{ "id": 5, "product": "Volleyball", "stock": 50 }
```

#### Get stock summary
```http
GET /product/5
```
```json
{ "ID": 5, "IN_STOCK": 49, "RESERVE": 1, "SOLD": 3 }
```

#### Reserve a unit
```http
POST /product/5/reserve
```
```json
{ "id": 5, "product": "Volleyball", "reservationToken": "550e8400-e29b-41d4-a716-446655440000" }
```

#### Confirm sale
```http
POST /product/5/sold
Content-Type: application/json

{ "reservationToken": "550e8400-e29b-41d4-a716-446655440000" }
```

#### Return reservation to stock
```http
POST /product/5/return
Content-Type: application/json

{ "reservationToken": "550e8400-e29b-41d4-a716-446655440000" }
```

#### Delete product
```http
DELETE /product/5
```
Returns `204 No Content` on success.  
Returns `409 Conflict` if active reservations or sales history exist.

### Error responses

| Status | Meaning |
|--------|---------|
| `400` | Validation error (invalid ID, empty product name, invalid UUID token) |
| `404` | Product or reservation not found |
| `409` | Conflict — cannot delete product with reservations or sales history |
| `422` | Missing required body fields (validated by TSOA) |
| `500` | Internal server error |

## Business Flow

```
 PATCH /stock  →  POST /reserve  →  POST /sold
                        ↓
                 POST /return
```

1. **Create/update stock** — `PATCH /product/:id/stock`
2. **Reserve** — decrements `IN_STOCK` by 1, records token in `RESERVED`
3. **Finalize**:
   - **Sold** — moves token from `RESERVED` to `SOLD` (stock stays decremented)
   - **Return** — removes token from `RESERVED`, increments `IN_STOCK` back
4. **Delete** — removes the product from `IN_STOCK` only when no active reservations or sales history exist

All reserve/return/sell/delete operations use database transactions with `SELECT FOR UPDATE` to prevent race conditions.

## Validation Rules

- `id` must be a positive integer
- `product` must be a non-empty string, max 100 characters
- `qtd` must be a non-negative integer
- `reservationToken` must be a valid **UUID v4** string

## Testing

### Unit tests
```bash
npm test
```

### E2E tests (requires Docker)
```bash
npm run test:e2e
```

E2E tests spin up a real MySQL instance via Docker Compose and run the full HTTP flow.

### Coverage
```bash
npm run test:coverage
```

Current coverage: **100%** statements / branches / functions / lines.

## Scripts

```bash
npm run dev            # Development with hot reload
npm run build          # Compile TypeScript + generate TSOA routes
npm start              # Start in production mode
npm test               # Run unit + e2e tests
npm run test:e2e       # Run e2e tests only
npm run test:coverage  # Run tests with coverage report
npm run lint           # ESLint + auto-fix
npm run lint:check     # ESLint check only
npm run format         # Prettier format
npm run clean          # Remove build/ and coverage/
```

## Project Structure

```
stock-management-system/
├── src/
│   ├── config/          # Database connection pool
│   ├── controllers/     # Express route handlers (TSOA)
│   ├── services/        # Business logic + input validation
│   ├── repositories/    # SQL queries + transactions
│   ├── models/          # TypeScript interfaces
│   └── customErrors/    # Custom error class
├── tests/
│   ├── *.spec.ts        # Unit tests
│   └── e2e/             # End-to-end tests
├── SQL/
│   └── stock.sql        # Database schema
├── build/               # Compiled output (generated)
└── Insomnia.json        # API collection
```

## Database Schema

```sql
CREATE TABLE `IN_STOCK` (
  `id`         int NOT NULL PRIMARY KEY,
  `product`    varchar(100) NOT NULL,
  `qtd`        int NOT NULL DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `RESERVED` (
  `id`               int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_stock`         int NOT NULL,
  `product`          varchar(100) NOT NULL,
  `reservationToken` varchar(100) NOT NULL UNIQUE,
  `created_at`       timestamp DEFAULT CURRENT_TIMESTAMP,
  `expires_at`       timestamp DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR)),
  FOREIGN KEY (`id_stock`) REFERENCES `IN_STOCK`(`id`) ON DELETE CASCADE
);

CREATE TABLE `SOLD` (
  `id`               int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_stock`         int NOT NULL,
  `product`          varchar(100) NOT NULL,
  `reservationToken` varchar(100) NOT NULL UNIQUE,
  `sold_at`          timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_stock`) REFERENCES `IN_STOCK`(`id`)
);
```

## Troubleshooting

**MySQL connection errors**
```bash
docker-compose ps          # Check container status
docker-compose down && docker-compose up -d  # Restart
```

**Build errors**
```bash
npm run clean && npm run build
```

**Reinstall dependencies**
```bash
rm -rf node_modules package-lock.json && npm install
```
