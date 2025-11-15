                                    FuelEU Maritime Compliance Platform

This project is a full-stack implementation of a compliance platform for the FuelEU Maritime regulation. It was built as a developer assignment to demonstrate skills in full-stack development, modern architecture, and testing.

The platform features a React frontend dashboard and a Node.js backend API to manage:

Vessel routes and emissions data

GHG intensity comparison against legal targets

Compliance Balance (CB) calculation

Surplus "Banking" (Article 20)

Pool-based compliance (Article 21)

Architecture

This project strictly follows a Hexagonal Architecture (Ports & Adapters) in both the frontend and backend. The core business logic is completely decoupled from frameworks and infrastructure, making it independently testable and maintainable.

---
Backend Architecture (/backend)
The backend (Node.js + Express) separates concerns into distinct layers:

src/core/domain: Contains pure, framework-agnostic TypeScript types and entities (e.g., Route, ComplianceBalance).

src/core/ports: Defines the interfaces (the "ports") that the core logic uses to communicate with the outside world (e.g., IRouteRepository, ICreatePoolUseCase).

src/core/application: Contains the core business logic and use cases (e.g., ComputeCBUseCase, CreatePoolUseCase). This layer has zero knowledge of Express or Prisma.

src/adapters/inbound/http: Contains the "inbound" adapters (e.g., RouteController) that translate HTTP requests into calls to the application's use cases.

src/adapters/outbound/postgres: Contains the "outbound" adapters (e.g., PrismaRouteRepository) that implement the repository ports using a specific tool (Prisma).

src/infrastructure: Contains all framework-specific setup, including the server.ts (Express) and prisma.client.ts (Prisma).

---
Frontend Architecture (/frontend)

The frontend (React + Vite) mirrors this philosophy to keep UI logic separate from the data source:

src/core/domain: Contains pure TypeScript types for frontend data (e.g., Route).

src/core/ports: Defines interfaces for external services, like IApiClient.

src/adapters/ui: Contains all React components, pages, and hooks. These are the "inbound" adapters for user interaction.

src/adapters/infrastructure/api: Contains the "outbound" adapter (ApiClient.ts) that implements the IApiClient port using axios to fetch data from the backend.

---
 Setup & Run Instructions

Follow these steps to get the entire application running locally.

Prerequisites
Node.js (v18+)

Docker Desktop

Git

1. Initial Setup
Clone the repository:



git clone https://github.com/YOUR_USERNAME/fuel-eu-maritime.git
cd fuel-eu-maritime
Create a docker-compose.yml file in the root of the project with the following content:

YAML

version: '3.8'
services:
  db:
    image: postgres:14
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: fueleu
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
Start the PostgreSQL database:



docker compose up -d
2. Run the Backend
Navigate to the backend folder:


cd backend
Install dependencies:


npm install
Create a .env file (it's pre-configured by prisma init):



# This file should be at /backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/fueleu?schema=public"
Run database migrations to create the tables:



npx prisma migrate dev
Seed the database with sample route data:



npx prisma db seed
Start the backend server:



npm run dev
The backend API is now running at http://localhost:3001

3. Run the Frontend
Open a new terminal (leave the backend running).

Navigate to the frontend folder:


cd frontend
Install dependencies:


npm install
Start the frontend development server:


npm run dev
The frontend application is now running at http://localhost:5173


 Testing

Backend Testing
The backend includes comprehensive unit tests for core logic (use cases) and integration tests for the API endpoints (using Supertest).

Navigate to the backend folder:



cd backend
Run all tests:



npm run test
Frontend Testing
Navigate to the frontend folder:


cd frontend
Run all tests:



npm run test
 API Endpoints & Samples
All endpoints are prefixed with /api.

Routes
GET /routes: Get all routes.

GET /routes/comparison: Get baseline vs. all other routes.

POST /routes/:id/baseline: Set a route as the new baseline.

Compliance
GET /compliance/cb?shipId&year: Compute and get the Compliance Balance for a ship.

GET /compliance/adjusted-cb?shipId&year: Get the CB after all bank applications.

Banking
GET /banking/records?shipId&year: Get banking history for a ship.

POST /banking/bank: Bank a ship's surplus for a given year.

POST /banking/apply: Apply (withdraw) a specific amount from the bank.

Pooling
POST /pools: Create a new compliance pool.

Sample Request: POST /api/pools

This request creates a valid pool where a surplus ship covers a deficit ship.


curl -X POST http://localhost:3001/api/pools \
-H "Content-Type: application/json" \
-d '{
    "year": 2024,
    "members": [
        { "shipId": "R002", "cbBefore": 621888000 },
        { "shipId": "R003", "cbBefore": -489294000 }
    ]
}'


 Dashboard Features & Screenshots

Note: You must run the application and take screenshots of the four tabs, then replace the placeholders below.

1. Routes Tab
Displays all routes from the database. Allows any route to be set as the new baseline.

2. Compare Tab
Compares all routes against the current baseline and the 2025 target. Shows compliance status and a visual chart.

3. Banking Tab
Allows a user to compute, bank, and apply compliance balances. Shows a running total of the ship's "banked" surplus.

4. Pooling Tab
Allows multiple ships to be entered into a pool. Validates that the pool's total balance is non-negative and shows the before and after allocation.