# Smart Notes Workspace

A full-stack note-taking application built with React and Node.js. Organize your thoughts with categories, tags, markdown support, and a clean dark/light interface.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![React](https://img.shields.io/badge/react-18-61DAFB)

## Features

- **Authentication** — Register and login with JWT. Sessions persist across page refreshes.
- **Full CRUD** — Create, view, edit, and delete notes with confirmation dialogs.
- **Rich Notes** — Categories, tags, pin notes to the top, archive notes.
- **Markdown** — Write in Markdown; toggle between rendered and raw view.
- **Search** — Debounced full-text search across title, content, and tags.
- **Filter & Sort** — Filter by category and status. Sort by date created, date updated, or title.
- **Pagination** — Navigate large note collections with smart page controls.
- **Optimistic UI** — Delete and pin actions update instantly without waiting for the server.
- **Profile** — Update your name, upload a profile avatar, and change your password.
- **Dark / Light theme** — Toggle persists across sessions.
- **Responsive** — Works on mobile, tablet, and desktop.
- **Swagger Docs** — Interactive API documentation at `/api-docs`.

## Tech Stack

**Frontend**
- React 18, React Router v6
- TanStack Query v5 (server state + caching)
- Redux Toolkit (auth + theme)
- React Hook Form + Zod (forms + validation)
- Axios (HTTP + interceptors)
- Tailwind CSS (styling + dark mode)
- react-markdown (Markdown rendering)
- Vite (build tool)

**Backend**
- Node.js, Express.js
- MongoDB + Mongoose
- JWT authentication, bcryptjs
- express-validator, Multer
- Swagger (swagger-jsdoc + swagger-ui-express)

## Project Structure

```
smart-notes-workspace/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── noteController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validate.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Note.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── notes.js
│   │   └── utils/
│   │       ├── db.js
│   │       └── swagger.js
│   ├── uploads/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Spinner.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── NoteCard.jsx
│   │   │   ├── NoteForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── hooks/
│   │   │   └── useDebounce.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NotesList.jsx
│   │   │   ├── NoteDetails.jsx
│   │   │   ├── CreateNote.jsx
│   │   │   ├── EditNote.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── noteService.js
│   │   ├── store/
│   │   │   ├── index.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       └── themeSlice.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
├── DOCUMENTATION.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local install or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smart-notes-workspace.git
cd smart-notes-workspace
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/smart-notes
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

### 4. Run locally

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001 |
| Swagger Docs | http://localhost:5001/api-docs |

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create a new account |
| POST | `/auth/login` | No | Login and receive JWT |
| GET | `/auth/me` | Yes | Get current user profile |
| PATCH | `/auth/me` | Yes | Update name / avatar image |
| PATCH | `/auth/change-password` | Yes | Change password |

### Notes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notes` | Yes | List notes (search, filter, sort, paginate) |
| GET | `/notes/:id` | Yes | Get a single note |
| POST | `/notes` | Yes | Create a note |
| PATCH | `/notes/:id` | Yes | Update a note |
| DELETE | `/notes/:id` | Yes | Delete a note |

**GET /notes query parameters:**

| Param | Description |
|-------|-------------|
| `search` | Full-text search (title, content, tags) |
| `category` | `personal` / `work` / `study` / `health` / `finance` / `other` |
| `status` | `active` / `archived` |
| `sortBy` | `createdAt` / `updatedAt` / `title` |
| `order` | `asc` / `desc` |
| `page` | Page number (default: 1) |
| `limit` | Items per page (default: 10) |

## Deployment

See the [Deployment Guide](#deployment-guide) section below for step-by-step instructions.

### Quick summary

| Part | Platform | Free tier |
|------|----------|-----------|
| Frontend | Vercel | Yes |
| Backend | Vercel | Yes |
| Database | MongoDB Atlas | Yes (512 MB) |

---

## Deployment Guide

### Step 1 — MongoDB Atlas (cloud database)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account.
2. Create a **free M0 cluster**.
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, click **Add IP Address → Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect → Drivers** and copy the connection string:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add the database name to the URL:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/smart-notes?retryWrites=true&w=majority
   ```
   Save this string — you'll need it twice below.

---

### Step 2 — Push to GitHub

```bash
cd "smart-notes-workspace"
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/your-username/smart-notes-workspace.git
git push -u origin main
```

---

### Step 3 — Deploy the Backend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
2. Configure the project:

   | Field | Value |
   |-------|-------|
   | **Root Directory** | `backend` |
   | **Framework Preset** | `Other` |
   | **Build Command** | `npm install` |
   | **Output Directory** | *(leave empty)* |

3. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | a long random string (min. 32 characters) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | *(add after frontend is deployed)* |

4. Click **Deploy**. Copy the URL — it looks like `https://smart-notes-api.vercel.app`.

---

### Step 4 — Deploy the Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the **same repo** again.
2. Configure the project:

   | Field | Value |
   |-------|-------|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | `Vite` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

3. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://smart-notes-api.vercel.app` (your backend URL from Step 3) |

4. Click **Deploy**. Copy the frontend URL — e.g. `https://smart-notes.vercel.app`.

---

### Step 5 — Connect frontend URL to backend CORS

1. Go back to your **backend** Vercel project → **Settings → Environment Variables**.
2. Add `FRONTEND_URL` = `https://smart-notes.vercel.app` (your frontend URL from Step 4).
3. Go to **Deployments** and click **Redeploy** to apply the change.

---

### One repo or two?

Keep everything in **one repository** (monorepo). Both Render and Vercel support deploying from a subfolder. Benefits:

- One place to manage issues, PRs, and history
- Frontend and backend changes can be tracked together
- Vercel and Render both auto-deploy when you push to `main`

If the project grows large (multiple teams, microservices), splitting repos makes sense — but for this scale, a monorepo is simpler.

---

## Environment Variables Reference

### Backend `.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (5001 locally, 10000 on Render) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs — use a long random string |
| `JWT_EXPIRES_IN` | Yes | Token lifetime (e.g. `7d`, `24h`) |
| `NODE_ENV` | No | `development` or `production` |

### Frontend `.env` (production)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend URL (e.g. `https://smart-notes-api.onrender.com`) |

## License

MIT
