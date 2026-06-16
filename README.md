<div align="center">

# GreenCommute

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E)](LICENSE)

Sustainability-focused web platform that helps users make smarter commuting decisions by prioritizing **environmental impact alongside convenience**.  
Designed to encourage eco-friendly travel habits through intelligent route planning and a clean, user-first experience.

</div>

---

## Features

- **Eco-Friendly Route Planning** — Choose travel routes optimized for lower environmental impact  
- **Minimal Green UI** — Clean and modern interface built around sustainability-focused design  
- **Authentication System** — Sign In and Register pages with scalable authentication flow  
- **Protected Commute Access** — Route planning available only after user authentication  
- **Source & Destination Input** — Enter trip locations for commute planning workflow  
- **Scalable Architecture** — Structured for future MERN stack backend integration and feature expansion  

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Running Locally

**1. Clone the repo**
```bash
git clone https://github.com/prachi-satbhai0741/GreenCommute.git
cd Green-Commute-main
```

**2. Start the Backend** (open a terminal)
```bash
cd backend
npm install
node server.js
```

**3. Start the Frontend** (open another terminal)
```bash
cd frontend
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

Create environment variables:

```env
MONGODB_URI=your-mongodb-url
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Run development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

## How It Works

```text
User visits landing page
        ↓
User registers or signs in
        ↓
Authenticated access is granted
        ↓
User enters source and destination
        ↓
System processes commute options
        ↓
Route recommendations prioritize sustainability
```

---

## Project Structure

```bash
Green-Commute-main/
│
├── frontend/                   # Next.js App (TypeScript)
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx        # Home / Dashboard page
│   │       ├── layout.tsx      # Navbar + Footer layout
│   │       ├── globals.css     # Global styles & design tokens
│   │       ├── signin/
│   │       │   └── page.tsx    # Sign In page
│   │       ├── register/
│   │       │   └── page.tsx    # Register page
│   │       └── plan/
│   │           └── page.tsx    # Commute planner page
│   ├── package.json
│   └── next.config.ts
│
├── backend/                    # Node.js / Express API
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, GetMe
│   │   ├── commuteController.js # Route calculation engine
│   │   └── userController.js   # Impact tracking (trips, CO2, points)
│   ├── middleware/
│   │   └── auth.js             # JWT protect middleware
│   ├── models/
│   │   └── User.js             # Mongoose User schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── commuteRoutes.js
│   │   └── userRoutes.js
│   ├── .env                    # Environment variables
│   ├── server.js               # Express server entry point
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | Next.js, React |
| Language | TypeScript |
| Styling | Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT, Google OAuth |
| Architecture | MERN Stack |

---

## Future Improvements

- Carbon footprint calculation for each route  
- Public transport integration  
- Live traffic and route optimization  
- Personalized sustainability insights  
- Commute history tracking and analytics  
- Gamification with eco-points and rewards  

---

## Contributing

```bash
git checkout -b feature/your-feature
# make changes
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

Create a Pull Request with a clear description of your changes.

---

## License

MIT License — see [LICENSE](LICENSE) for more details.
