# NextUse API 🌱

> Backend REST API for the NextUse recycling platform — enabling households to sort recyclable waste and exchange it for value.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v22 |
| Framework | Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| CORS | cors |

---

## Project Structure

```
nextuse_backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authCtrl.js           # Register, login, profile
│   │   ├── inventoryCtrl.js      # Add waste, view inventory
│   │   ├── pickupCtrl.js         # Full pickup lifecycle
│   │   └── redeemCtrl.js         # Points redemption, wallet
│   ├── middleware/
│   │   └── authZ.js              # JWT protect + role authorize
│   ├── models/
│   │   ├── user.js
│   │   ├── inventory.js
│   │   ├── pickup.js
│   │   └── pointsLog.js
│   └── routes/
│       ├── authRoute.js
│       ├── inventoryRoute.js
│       ├── pickupRoute.js
│       └── redeemRoute.js
├── app.js                        # Express app setup & route mounting
├── server.js                     # Entry point
├── package.json
└── .env                          # Environment variables (never commit)
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
```

> ⚠️ Never commit `.env` to version control. It is already excluded in `.gitignore`.

---

## Installation & Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/Happiness-arch/NEXTUSE_API.git
cd NEXTUSE_API

# 2. Install dependencies
npm install

# 3. Create .env file and add environment variables

# 4. Start the server
node server.js
```

Server runs on `http://localhost:8000`

---

## Docker Setup

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8000
CMD ["node", "server.js"]
```

```bash
# Build image
docker build -t nextuse-api .

# Run container
docker run -p 8000:8000 --env-file .env nextuse-api
```

---

## Health Check

```
GET /health
```

Returns `{ "status": "ok" }` — use this to verify the service is running after deployment.

---

## API Routes

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | All roles |
| PUT | /api/auth/update-profile | All roles |
| GET | /api/auth/all-users | Admin only |
| POST | /api/inventory/add | Household only |
| GET | /api/inventory/me | Household only |
| POST | /api/pickups | Household only |
| GET | /api/pickups/my-pickups | Household only |
| GET | /api/pickups/assigned | Driver only |
| GET | /api/pickups/all | Admin only |
| PUT | /api/pickups/:id/assign | Admin only |
| PUT | /api/pickups/:id/deliver | Driver only |
| PUT | /api/pickups/:id/approve | Admin only |
| POST | /api/redeem | Household only |
| GET | /api/redeem/wallet | Household only |

> Full API documentation with request/response examples is available separately.

---

## Roles

| Role | Description |
|------|-------------|
| `household` | Logs waste, requests pickups, earns and redeems points |
| `driver` | Collects waste, updates actual weights, earns money per kg |
| `admin` | Assigns drivers, approves pickups, views all data |

---

## Pickup Lifecycle

```
pending → assigned → delivered → completed
```

1. Household requests pickup (minimum 5kg in inventory)
2. Admin assigns a driver
3. Driver collects waste, updates actual weights → marks delivered
4. Admin approves → points awarded to household, earnings to driver

---

## Reward System

| Waste Type | Points Per Kg |
|------------|--------------|
| plastic | 5 |
| glass | 4 |
| paper | 3 |
| metal | 8 |

- Minimum **100 points** to redeem
- **100 points = ₦500** wallet credit
- Driver earns **₦100 per kg** collected

---

## Security Notes

- `JWT_SECRET` must be a strong random string (minimum 32 characters)
- `MONGO_URI` should use a dedicated DB user with limited permissions
- CORS is currently open — restrict to specific origins in production
- All protected routes require a valid JWT token
- Passwords are hashed with bcrypt before storage

---

## Team

| Role | Responsibility |
|------|---------------|
| Backend | Node.js API (this repo) |
| Mobile | Flutter app — consumes this API |
| DevOps | Docker + Render deployment |
| Data Science | AI integration + analytics |
| Cybersecurity | Security review |
| Product | Roadmap + requirements |
| Design | UI/UX wireframes |
