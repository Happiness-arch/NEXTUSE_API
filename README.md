# NextUse API 🌱

> Backend REST API for the NextUse recycling platform — enabling households to sort recyclable waste and exchange it for value.

---

## Core Features

- Household recycling pickup requests
- Inventory threshold tracking
- Reward points system
- AI recommendation integration
- Driver assignment workflow
- Cloud deployment support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v22 |
| Framework | Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| AI Integration | Groq SDK (Llama 3.3 70B) |
| Rate Limiting | express-rate-limit |
| Deployment | Render |

---

## Project Structure

```
nextuse_backend/
├── src/
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── controllers/
│   │   ├── authCtrl.js               # Register, login, profile, create-staff
│   │   ├── inventoryCtrl.js          # Add, view, remove inventory items
│   │   ├── pickupCtrl.js             # Full pickup lifecycle
│   │   ├── productCtrl.js            # Products library
│   │   ├── redeemCtrl.js             # Points redemption, wallet
│   │   ├── pointsCtrl.js             # Points history
│   │   └── ecobotCtrl.js             # AI EcoBot integration
│   ├── middleware/
│   │   └── authZ.js                  # JWT protect + role authorize
│   ├── models/
│   │   ├── user.js
│   │   ├── inventory.js
│   │   ├── pickup.js
│   │   ├── products.js
│   │   └── pointsLog.js
│   ├── routes/
│   │   ├── authRoute.js
│   │   ├── inventoryRoute.js
│   │   ├── pickupRoute.js
│   │   ├── productRoute.js
│   │   ├── redeemRoute.js
│   │   ├── pointsRoute.js
│   │   └── ecobotRoute.js
│   └── seed/
│       └── seedProducts.js           # Database seeder
├── app.js                            # Express app setup & route mounting
├── server.js                         # Entry point
├── package.json
└── .env                              # Environment variables (never commit)
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
GROQ_API_KEY=your_groq_api_key
```

> Never commit `.env` to version control. Already excluded in `.gitignore`.

---

## Installation & Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/Happiness-arch/NEXTUSE_API.git
cd NEXTUSE_API

# 2. Install dependencies
npm install

# 3. Create .env file and add environment variables

# 4. Seed the products database
node src/seed/seedProducts.js

# 5. Start development server
npm run dev
```

Server runs on `http://localhost:8000`

---

## Seeding the Database

Run this once to populate the recyclables library:

```bash
node src/seed/seedProducts.js
```

This seeds 15 recyclable products across plastic, metal, paper, and glass categories.

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
docker build -t nextuse-api .
docker run -p 8000:8000 --env-file .env nextuse-api
```

---

## Health Check

```
GET /
```

Returns `{ "status": "ok", "message": "NEXTUSE API running" }`

---

## API Routes

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | All roles |
| PUT | /api/auth/update-profile | All roles |
| GET | /api/auth/all-users | Admin only |
| POST | /api/auth/create-staff | Admin only |
| GET | /api/products | All roles |
| POST | /api/inventory/add | Household only |
| GET | /api/inventory/me | Household only |
| DELETE | /api/inventory/item/:productId | Household only |
| POST | /api/pickups | Household only |
| GET | /api/pickups/my-pickups | Household only |
| PUT | /api/pickups/:id/reschedule | Household only |
| GET | /api/pickups/assigned | Driver only |
| GET | /api/pickups/all | Admin only |
| PUT | /api/pickups/:id/assign | Admin only |
| PUT | /api/pickups/:id/deliver | Driver only |
| PUT | /api/pickups/:id/approve | Admin only |
| POST | /api/redeem | Household only |
| GET | /api/redeem/wallet | Household only |
| GET | /api/points/history | Household only |
| POST | /api/ecobot/chat | All roles |
| GET | /api/ecobot/tips | All roles |

---

## Roles

| Role | How Created | Description |
|------|-------------|-------------|
| household | Self-registration via app | Logs waste, requests pickups, earns and redeems EcoPoints |
| driver | Created by admin via /api/auth/create-staff | Collects waste, marks pickups delivered |
| admin | Created by existing admin or manually in DB | Assigns drivers, approves pickups, views all data |

---

## Pickup Lifecycle

```
pending → assigned → delivered → completed
```

1. Household logs items (minimum 5000 EcoPoints threshold)
2. Household requests pickup with date and time slot
3. Admin assigns a driver
4. Driver collects waste and marks as delivered
5. Admin approves → EcoPoints awarded → inventory cleared

---

## EcoPoints System

| Category | Example Items |
|----------|--------------|
| plastic | PET Bottles, HDPE Bottles, Plastic Spoons |
| metal | Metal Drink Cans, Metal Food Cans |
| paper | Egg Cartons, Cardboard Boxes, Milk Cartons |
| glass | Wine Bottles, Beer Bottles, Glass Jars |

**Redemption minimums:**
- Airtime: 1,000 EcoPoints
- Data: 1,000 EcoPoints  
- Electricity: 5,000 EcoPoints

---

## Security

- JWT authentication with 1-day token expiry
- bcrypt password hashing (salt rounds: 10)
- Role-based access control on all protected routes
- Login rate limiting: 3 attempts per 5 minutes
- General rate limiting: 100 requests per 15 minutes
- Roles assigned server-side — clients cannot self-assign admin/driver

---

## AI Integration

EcoBot is powered by Llama 3.3 70B via Groq infrastructure. It answers recycling questions, provides waste sorting guidance, and delivers eco-friendly tips tailored to Nigerian context.

```
POST /api/ecobot/chat
{ "message": "Can I recycle a greasy pizza box?" }
```

---

## Deployment

- **Platform**: Render
- **Live URL**: https://nextuse-api.onrender.com
- **CI/CD**: Auto-deploys from GitHub main branch
- **Database**: MongoDB Atlas
