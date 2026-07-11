# DriveX Motors - Full-Stack Vehicle Marketplace

A complete vehicle marketplace platform where customers browse, buy, sell, and negotiate car purchases.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend      │────▶│    Backend       │────▶│    Database      │
│  React + Nginx   │     │  Node.js/Express │     │  PostgreSQL 16   │
│  Port 3000       │     │  Port 5000       │     │  Port 5432       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

Each service has its own `Dockerfile` and can be deployed independently.

## Quick Start

```bash
# Clone and start everything
docker-compose up --build

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
# Database: localhost:5432
```

## Demo Accounts

| Role     | Email                 | Password     |
|----------|-----------------------|--------------|
| Admin    | admin@drivex.com      | admin123     |
| Customer | customer@example.com  | customer123  |

## Features

### Customer
- Browse vehicle catalog with advanced filtering (make, price, year, condition, fuel, transmission)
- View detailed vehicle specs, gallery, and reviews
- Purchase vehicles (cash, financing, trade-in)
- Make offers / negotiate prices on any vehicle
- Submit cars for sale
- Save/favorite vehicles
- Manage profile and password
- View purchase history and offer status

### Admin
- Dashboard with revenue, sales, and inventory stats
- Full CRUD on vehicle inventory
- Manage purchases and update statuses
- Review sell submissions and make offers
- View all customer offers
- View all users

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/profile` - Get profile (auth required)
- `PUT /api/auth/profile` - Update profile (auth required)
- `PUT /api/auth/password` - Change password (auth required)

### Vehicles
- `GET /api/vehicles` - List (with filters: category, make, minPrice, maxPrice, year, condition, fuel, transmission, search, sort, page, limit)
- `GET /api/vehicles/makes` - List unique makes
- `GET /api/vehicles/categories` - List categories
- `GET /api/vehicles/:id` - Vehicle detail + reviews
- `POST /api/vehicles/:id/save` - Toggle save (auth required)
- `GET /api/vehicles/user/saved` - Saved vehicles (auth required)
- `POST /api/vehicles/:id/reviews` - Add review (auth required)

### Purchases
- `POST /api/purchases` - Buy a vehicle (auth required)
- `GET /api/purchases/my` - My purchases (auth required)
- `PUT /api/purchases/:id/cancel` - Cancel (auth required)

### Sell
- `POST /api/sell` - Submit car for sale
- `GET /api/sell/my` - My submissions (auth required)

### Offers
- `POST /api/offers` - Make an offer (auth required)
- `GET /api/offers/my` - My offers (auth required)
- `PUT /api/offers/:id/respond` - Counter/accept/reject (auth required)

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET|POST /api/admin/vehicles` - List/create vehicles
- `PUT|DELETE /api/admin/vehicles/:id` - Update/delete vehicle
- `GET /api/admin/purchases` - All purchases
- `PUT /api/admin/purchases/:id` - Update purchase status
- `GET /api/admin/sell-submissions` - All sell submissions
- `PUT /api/admin/sell-submissions/:id` - Update submission
- `GET /api/admin/offers` - All offers
- `GET /api/admin/users` - All users
- `GET /api/admin/inquiries` - All inquiries

### Inquiries
- `POST /api/inquiries` - Submit inquiry

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router, Lucide Icons |
| Backend   | Node.js 20, Express 4, PostgreSQL (pg), JWT Auth, bcryptjs |
| Database  | PostgreSQL 16 |
| DevOps    | Docker, Docker Compose, Nginx |

## Local Development (without Docker)

```bash
# Database - run PostgreSQL locally or via Docker
docker run -d --name drivex-db -p 5432:5432 -e POSTGRES_DB=drivemotors -e POSTGRES_USER=drivex -e POSTGRES_PASSWORD=drivex_secret_2024 postgres:16-alpine

# Backend
cd backend
cp .env.example .env  # Edit DB_HOST to localhost
npm install
npm run seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Deployment

Each service has its own `Dockerfile` and can be deployed to:
- **AWS ECS/Fargate** - Deploy each container separately
- **Kubernetes** - Use the Dockerfiles to build images
- **DigitalOcean App Platform** - Point each service to its Dockerfile
- **Any container orchestration platform**

For production, update:
- `JWT_SECRET` in backend environment
- `POSTGRES_PASSWORD` in database environment
- `FRONTEND_URL` for CORS configuration
