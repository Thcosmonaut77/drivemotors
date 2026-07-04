# DriveX Motors - Full-Stack Application

## Overview

A premium automobile dealership website with a Node.js/Express backend and dynamic frontend.

## Project Structure

```
drivemotors/
├── server.js          # Express API + static file server
├── db.js              # SQLite database setup
├── seed.js            # Database seeder (6 vehicles)
├── package.json
├── Dockerfile
├── docker-compose.yml
├── buildspec.yml      # AWS CodeBuild spec
├── public/
│   └── index.html     # Frontend (fetches from API)
└── .env.example
```

## API Endpoints

| Method | Path              | Description              |
|--------|-------------------|--------------------------|
| GET    | /api/vehicles     | List vehicles (query: ?featured=true, ?category=sedan) |
| GET    | /api/vehicles/:id | Single vehicle           |
| POST   | /api/contact      | Submit contact form      |
| GET    | /api/health       | Health check             |

## Local Development

```bash
cp .env.example .env
npm install
npm run seed
npm start
```

Open http://localhost:4000

## AWS Deployment

### Option 1: Elastic Beanstalk (recommended)

1. Zip the project (excluding node_modules/ and data/)
2. Upload to Elastic Beanstalk (Node.js 20 platform)
3. Set environment variable: `NODE_ENV=production`
4. Add `npm run seed` to the post-deploy hook or run once manually

### Option 2: ECS / Fargate

```bash
docker build -t drivemotors .
docker tag drivemotors <account>.dkr.ecr.<region>.amazonaws.com/drivemotors
docker push <account>.dkr.ecr.<region>.amazonaws.com/drivemotors
```

Create an ECS Fargate task using that image. Mount an EFS volume at `/app/data` for persistent SQLite storage, or migrate to RDS (PostgreSQL) for production.

### Option 3: EC2

```bash
# On a fresh Amazon Linux 2023 instance
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs git
git clone <repo> drivemotors-tmp
mv drivemotors-tmp/* drivemotors/ && rm -rf drivemotors-tmp
cd drivemotors
cp .env.example .env
npm install
npm run seed
npm start
```

Use systemd or PM2 for process management.

### Production Database

SQLite works well for low-traffic. For higher scale, swap to PostgreSQL:

1. Create an RDS PostgreSQL instance
2. Replace `better-sqlite3` with `pg` and update `db.js`
3. Add RDS environment variables to Elastic Beanstalk / ECS
