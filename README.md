# Stock Management System 📦

A modern stock management system built with TypeScript, Node.js, Express, and MySQL. It provides complete features to manage inventory, reservations, and sales via a well-structured REST API.

## ✨ Features

- **Inventory Management**: Create, update, and query stock items
- **Reservation System**: Temporarily reserve items using unique tokens
- **Sales Tracking**: Record sales with history
- **Automatic Cleanup**: Automatic removal of expired reservations
- **RESTful API**: Consistent, well-documented interface
- **Swagger Docs**: Interactive API documentation
- **Test Coverage**: Unit tests with Jest and coverage reports

## 🛠️ Tech Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: MySQL 8.4 with connection pool
- **Driver**: mysql2 with prepared statements
- **Documentation**: TSOA + Swagger UI
- **Tests**: Jest, ts-jest with coverage
- **Quality**: ESLint, Prettier
- **Container**: Docker Compose
- **Validation**: Custom data validation

## 📋 Prerequisites

Make sure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher)
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Setup

### 1. Clone the repository
```bash
git clone https://github.com/luizcurti/stock-management-system.git
cd stock-management-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
# Copy example file
cp .env.example .env

# Edit the .env with your settings
# Default values should work fine for local development
```

### 4. Start the database
```bash
# Start MySQL container with tables automatically created
docker-compose up -d

# Check container status
docker-compose ps
```

### 5. Run the application

#### Development (with hot reload)
```bash
npm run dev
```

#### Production
```bash
npm run build
npm start
```

## 📖 API Usage

The API will be available at `http://localhost:3000` after starting the app.

### Interactive Documentation
Access Swagger docs at: `http://localhost:3000/docs`

### Main Endpoints

#### Get Stock
```bash
GET /product/{id}/
```

#### Create/Update Stock
```bash
PATCH /product/{id}/stock
Content-Type: application/json

{
  "product": "Soccer Ball",
  "qtd": 50
}
```

#### Reserve Item
```bash
POST /product/{id}/reserve
```

#### Confirm Sale
```bash
POST /product/{id}/sold
Content-Type: application/json

{
  "reservationToken": "uuid-token"
}
```

#### Return Reservation to Stock
```bash
POST /product/{id}/
Content-Type: application/json

{
  "reservationToken": "uuid-token"
}
```

### Testing with Insomnia/Postman
The `Insomnia.json` file contains a complete collection of requests.

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run with coverage
```bash
npm run test:coverage
```

### Watch mode
```bash
npm run test:watch
```

### Coverage reports
Reports are generated under `coverage/` and include:
- HTML report at `coverage/lcov-report/index.html`
- LCOV report for CI/CD integrations

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm start            # Start in production mode

# Tests
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint and fix issues
npm run lint:check   # Check issues without fixing
npm run format       # Format code with Prettier

# Utilities
npm run clean        # Clean build and coverage artifacts
npm run restart      # Build and start
```

## 🏗️ Project Structure

```
stock-management-system/
├── src/
│   ├── config/          # Configuration (database, etc.)
│   ├── controllers/     # API controllers
│   ├── services/        # Business logic
│   ├── repositories/    # Data access layer
│   ├── models/          # Interfaces and types
│   └── customErrors/    # Custom error classes
├── tests/               # Unit tests
├── SQL/                 # Database scripts
├── build/               # Compiled files (generated)
├── coverage/            # Coverage reports (generated)
└── docs/                # Additional documentation
```

## 🗄️ Database Schema

### Table IN_STOCK
```sql
CREATE TABLE `IN_STOCK` (
  `id` int NOT NULL PRIMARY KEY,
  `product` varchar(100) NOT NULL,
  `qtd` int NOT NULL DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table RESERVED
```sql
CREATE TABLE `RESERVED` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_stock` int NOT NULL,
  `product` varchar(100) NOT NULL,
  `reservationToken` varchar(100) NOT NULL UNIQUE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR))
);
```

### Table SOLD
```sql
CREATE TABLE `SOLD` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_stock` int NOT NULL,
  `product` varchar(100) NOT NULL,
  `reservationToken` varchar(100) NOT NULL,
  `sold_at` timestamp DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 Business Flow

1. **Create/Update Product**: Use `PATCH /product/{id}/stock` to create/update stock
2. **Reserve**: Use `POST /product/{id}/reserve` to reserve (temporarily decreases stock)
3. **Finalize**:
   - `POST /product/{id}/sold` to confirm sale (removes reservation)
   - `POST /product/{id}/` to return to stock (cancels reservation)
4. **Auto Cleanup**: Reservations automatically expire in 24h

## 🐛 Troubleshooting

### MySQL connection errors
```bash
# Check if the container is running
docker-compose ps

# Restart if necessary
docker-compose down
docker-compose up -d
```

### Dependency issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build errors
```bash
# Clean build artifacts
npm run clean
npm run build
```