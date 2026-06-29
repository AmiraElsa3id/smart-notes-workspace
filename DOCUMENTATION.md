# Smart Notes Workspace — Technical Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Backend Deep Dive](#3-backend-deep-dive)
4. [Frontend Deep Dive](#4-frontend-deep-dive)
5. [Data Flow](#5-data-flow)
6. [Authentication Flow](#6-authentication-flow)
7. [State Management](#7-state-management)
8. [API Reference](#8-api-reference)

---

## 1. Project Overview

Smart Notes Workspace is a full-stack note-taking application. Users can register, log in, and manage personal notes with rich features like categories, tags, pinning, markdown rendering, search, filtering, and sorting.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| Client state | Redux Toolkit |
| Forms & validation | React Hook Form + Zod |
| HTTP client | Axios |
| Styling | Tailwind CSS v3 |
| Markdown | react-markdown |
| Build tool | Vite |
| Backend framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (jsonwebtoken) |
| Password hashing | bcryptjs |
| File uploads | Multer |
| Validation | express-validator |
| API docs | Swagger (swagger-jsdoc + swagger-ui-express) |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                      │
│                                                           │
│  React App                                                │
│  ├── Redux Store  (auth token, user, theme)               │
│  ├── TanStack Query  (notes cache, server state)          │
│  ├── React Router  (page navigation, protected routes)    │
│  └── Axios  (HTTP requests with JWT header)               │
└────────────────────────┬────────────────────────────────┘
                         │  HTTP (JSON)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Express.js Server                      │
│                                                           │
│  Middleware stack:                                        │
│  CORS → JSON parser → Auth guard → Route handler          │
│                                                           │
│  Routes:                                                  │
│  /auth/*   → authController                               │
│  /notes/*  → noteController  (protected)                  │
│  /uploads  → static files                                 │
└────────────────────────┬────────────────────────────────┘
                         │  Mongoose ODM
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      MongoDB                              │
│                                                           │
│  Collections:                                             │
│  users   { name, email, password(hashed), avatar }        │
│  notes   { title, content, category, tags, status,        │
│            isPinned, userId, timestamps }                  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Backend Deep Dive

### Entry Point — `src/app.js`

```
dotenv.config()          ← loads .env variables
connectDB()              ← connects to MongoDB (async, non-blocking)
app.use(cors(...))       ← allow requests from frontend origin
app.use(express.json())  ← parse JSON request bodies
app.use('/uploads', static) ← serve uploaded avatar images
app.use('/auth', authRoutes)
app.use('/notes', noteRoutes)
swaggerDocs(app)         ← mount /api-docs
app.listen(PORT)
```

### Models

#### User (`src/models/User.js`)
- Password is **hashed automatically** via a Mongoose `pre('save')` hook using bcryptjs with salt rounds of 12
- The `comparePassword` method handles login verification
- `toJSON()` strips the password field from any JSON output so it is never sent to the client

#### Note (`src/models/Note.js`)
- `userId` is an ObjectId reference to the User — this is how notes are scoped per user
- A **compound index** on `{ userId, createdAt }` makes paginated queries fast
- A **text index** on `{ title, content, tags }` powers full-text search via `$text: { $search: query }`
- `isPinned` notes always appear first because the sort always includes `{ isPinned: -1 }` before the user-chosen sort field

### Middleware

#### `middleware/auth.js` — JWT Guard
```
Request comes in
  → Check Authorization header for "Bearer <token>"
  → Verify token with JWT_SECRET
  → Look up user in DB (excludes password)
  → Attach user to req.user
  → Call next() to proceed to route handler
  → On any failure: return 401
```

#### `middleware/validate.js` — Input Validation
Wraps `express-validator`'s `validationResult`. If any validation rules on the route fail, it returns a 400 with an `errors` array before the controller runs.

### Controllers

#### `authController.js`
| Function | What it does |
|----------|-------------|
| `register` | Creates user, signs JWT, returns `{ token, user }` |
| `login` | Finds user by email, compares password, returns `{ token, user }` |
| `getMe` | Returns `req.user` (already populated by auth middleware) |
| `updateProfile` | Updates name and/or avatar file path |
| `changePassword` | Verifies current password, hashes and saves new one |

#### `noteController.js`
All note operations filter by `userId: req.user._id` — users can only see and modify their own notes.

| Function | Key logic |
|----------|-----------|
| `getNotes` | Builds a dynamic filter object, applies `$text` search if query present, sorts with pinned-first, paginates with skip/limit |
| `getNoteById` | Single note lookup with user scope check |
| `createNote` | Creates with userId attached |
| `updateNote` | `findOneAndUpdate` with user scope — safe from other users editing |
| `deleteNote` | `findOneAndDelete` with user scope |

### File Uploads
Multer is configured with `diskStorage` to save files to the `backend/uploads/` directory. The filename is `{userId}-{timestamp}.{ext}` to avoid collisions. Uploaded avatars are served as static files at `/uploads/filename`.

---

## 4. Frontend Deep Dive

### Routing — `App.jsx`

```
/login          → Login page (public)
/register       → Register page (public)
/               → ProtectedRoute wrapping Layout
  /dashboard    → Dashboard
  /notes        → NotesList
  /notes/new    → CreateNote
  /notes/:id    → NoteDetails
  /notes/:id/edit → EditNote
  /profile      → Profile
*               → NotFound (404)
```

`ProtectedRoute` reads `isAuthenticated` from Redux. If false, redirects to `/login` and saves the attempted path in location state so the user is redirected back after login.

### Component Tree

```
App
└── Layout
    ├── Navbar  (logo, theme toggle, user avatar, logout)
    ├── Sidebar  (navigation links)
    └── <Outlet />  (active page renders here)
        ├── Dashboard
        ├── NotesList
        ├── CreateNote / EditNote  (both use NoteForm)
        ├── NoteDetails
        └── Profile
```

Shared UI components live in `components/ui/`:
- `Spinner` — animated loading indicator
- `Modal` — accessible overlay with Escape key support and backdrop click to close

### Forms — React Hook Form + Zod

Every form uses this pattern:
```js
const schema = z.object({ ... });          // 1. Define shape + rules with Zod
const { register, handleSubmit, formState } = useForm({
  resolver: zodResolver(schema),            // 2. Connect Zod to RHF
});
// 3. RHF only calls onSubmit if all Zod rules pass
<form onSubmit={handleSubmit(onSubmit)}>
```

This means validation happens entirely client-side before any network request is made. Server-side validation (express-validator) is the safety net.

### Data Fetching — TanStack Query

Notes data is managed by TanStack Query. Key patterns used:

**Query keys are arrays** that encode the current filter state:
```js
queryKey: ['notes', { search, category, status, sortBy, order, page }]
```
When any filter changes, a new cache entry is created and a fresh request fires.

**`keepPreviousData: true`** on NotesList — when the user changes page or filter, the old data stays visible (with reduced opacity) until new data arrives, preventing layout jumps.

**Optimistic updates** on NoteCard delete and pin:
```
User clicks Delete
  → Immediately remove note from cache (UI updates instantly)
  → Send DELETE request to server
  → On error: restore previous cache (rollback)
  → On settle: invalidate query to sync with server
```

### Debounced Search

`useDebounce(value, 400)` delays the search query key update by 400ms after the user stops typing. Without this, every keystroke would fire a server request.

```
User types "r" "e" "a" "c" "t"
  → debounce timer resets on each keystroke
  → 400ms after "t" is typed, debouncedSearch = "react"
  → TanStack Query fires ONE request
```

### Axios Instance — `services/api.js`

A single Axios instance is created with two interceptors:

**Request interceptor** — reads the JWT token from Redux store and attaches it to every request:
```
Authorization: Bearer <token>
```

**Response interceptor** — if any response comes back as 401 (token expired/invalid), it dispatches `logout()` to Redux (clears token and user) and redirects to `/login`.

---

## 5. Data Flow

### Creating a Note (full flow)

```
1. User fills NoteForm and clicks "Save Note"
2. Zod validates the form data client-side
3. React Hook Form calls onSubmit with validated data
4. Tags string "react, js" is split into ["react", "js"]
5. useMutation calls createNote() service function
6. Axios attaches JWT token via request interceptor
7. POST /notes → Express router → auth middleware → noteController.createNote
8. Mongoose creates document with userId = req.user._id
9. Server returns the new note object (201)
10. onSuccess: invalidate ['notes'] query → TanStack Query refetches
11. navigate() sends user to /notes/:id (the new note's detail page)
```

### Searching Notes (full flow)

```
1. User types in search box
2. useDebounce waits 400ms
3. debouncedSearch value updates
4. TanStack Query detects new query key → fires GET /notes?search=...
5. Backend runs Note.find({ $text: { $search: query }, userId: ... })
6. MongoDB uses text index to match title, content, tags
7. Results return, TanStack Query updates cache, UI re-renders
```

---

## 6. Authentication Flow

```
REGISTER / LOGIN:
  Client sends credentials
    → Server validates input
    → Server creates/finds user
    → Server signs JWT: jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    → Server returns { token, user }
    → Client dispatches setCredentials({ token, user })
    → Redux saves to store AND localStorage
    → User is redirected to dashboard

SUBSEQUENT REQUESTS:
  Axios request interceptor reads token from Redux store
    → Adds "Authorization: Bearer <token>" header
    → Server middleware verifies token: jwt.verify(token, JWT_SECRET)
    → Decoded { id } is used to fetch user from DB
    → req.user is set, request proceeds

TOKEN EXPIRY / LOGOUT:
  Server returns 401
    → Axios response interceptor catches it
    → Dispatches logout() action
    → Redux clears token and user, removes from localStorage
    → Browser redirects to /login

PAGE REFRESH:
  Redux initializes from localStorage (token and user)
    → If token exists, isAuthenticated = true
    → ProtectedRoute allows access
    → Token is still attached to all requests
    → If token is actually expired, first API call returns 401 and triggers logout flow above
```

---

## 7. State Management

Two Redux slices handle global client state:

### `authSlice`
```
{ token, user, isAuthenticated }

Actions:
  setCredentials({ token, user })  → set after login/register
  updateUser(partialUser)          → set after profile update
  logout()                         → clear everything
```
Also persists to `localStorage` so state survives page refresh.

### `themeSlice`
```
{ mode: 'light' | 'dark' }

Actions:
  toggleTheme()  → flip between light and dark
  setTheme(mode) → set explicitly
```
`App.jsx` watches `theme` and toggles the `dark` class on `<html>`. Tailwind's `darkMode: 'class'` config makes all `dark:` variants activate when that class is present.

**TanStack Query handles all server/async state** (notes list, individual note, loading/error states). Redux only handles truly global client-side state (auth and theme).

---

## 8. API Reference

### Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Get JWT token |
| GET | `/auth/me` | Yes | Get current user |
| PATCH | `/auth/me` | Yes | Update name / avatar |
| PATCH | `/auth/change-password` | Yes | Change password |

### Notes Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notes` | Yes | List notes (filterable, paginated) |
| GET | `/notes/:id` | Yes | Single note |
| POST | `/notes` | Yes | Create note |
| PATCH | `/notes/:id` | Yes | Update note |
| DELETE | `/notes/:id` | Yes | Delete note |

### GET /notes Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Full-text search on title, content, tags |
| `category` | string | — | Filter: personal, work, study, health, finance, other |
| `status` | string | — | Filter: active, archived |
| `sortBy` | string | `createdAt` | Sort field |
| `order` | string | `desc` | `asc` or `desc` |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page |

Full interactive docs available at `/api-docs` when running locally.
