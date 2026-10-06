# Developer Vault: Bookmark & Resource Vault

A full-stack MERN application where developers save, organize, search, filter, edit and delete useful resources (documentation, tutorials, GitHub repos, tools). Paste a URL and the title, description, preview image and favicon are fetched automatically.

## Features

- Register / login with bcrypt-hashed passwords and JWT sessions; protected routes on both client and API
- Add resources by URL with **automatic metadata** (Open Graph + HTML parsing) and a live editable preview
- Full CRUD, favorites (optimistic UI), copy URL, resource details page
- **Search** across title, description, website and tags (debounced, no page reload)
- **Combined filters**: category + resource type + favorites, sorting, pagination, "Clear filters"
- Dashboard with live stats (total, favorites, categories in use, added in the last 7 days)
- Categories page with per-category counts; Favorites page
- Settings: edit profile, light/dark theme, **export bookmarks as JSON**
- Skeleton loaders, empty states, toasts, delete confirmation, accessible dialogs, responsive layout (desktop sidebar, tablet/mobile drawer)
- **Premium plans (Free / Pro / Team)** with Razorpay checkout in **test mode**: resource limits, unlimited tags and custom categories on paid plans
- Optional demo seed data kept in a separate demo account

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 3, React Router 6, Axios, Lucide React |
| Backend | Node.js, Express 4, JWT (`jsonwebtoken`), `bcryptjs`, Cheerio + Axios (metadata), Helmet, CORS, express-rate-limit |
| Database | MongoDB Atlas, Mongoose 8 |

`bcryptjs` is a pure-JavaScript bcrypt implementation. It produces standard bcrypt hashes and avoids native build problems on Windows.

## Folder structure

```
developer-vault/
├── client/                    # React + Vite frontend
│   ├── public/                # favicon, _redirects (SPA fallback for Netlify)
│   └── src/
│       ├── components/        # Sidebar, ResourceCard, ResourceGrid, ResourceBrowser, SearchBar,
│       │                      # FilterBar, StatsCard, Add/EditResourceModal, ResourceForm,
│       │                      # MetadataPreview, EmptyState, LoadingSkeleton, ConfirmDeleteModal, ...
│       ├── pages/             # Landing, Login, Register, Dashboard, Resources, Favorites,
│       │                      # Categories, ResourceDetails, Settings, NotFound
│       ├── layouts/           # DashboardLayout (sidebar / mobile drawer)
│       ├── context/           # Auth, Theme, Toast, Vault (modals + refresh signalling)
│       ├── hooks/             # useDebounce, useBookmarks
│       ├── services/          # api.js (Axios), authService, bookmarkService
│       └── utils/             # constants, helpers
└── server/                    # Express REST API
    ├── config/db.js
    ├── controllers/           # authController, bookmarkController, userController
    ├── middleware/            # authMiddleware, errorMiddleware, sanitize
    ├── models/                # User, Bookmark
    ├── routes/                # authRoutes, bookmarkRoutes, userRoutes, categoryRoutes
    ├── services/metadataService.js
    ├── seed.js                # optional demo data
    └── server.js
```

## Environment variables

**server/.env** (copy from `server/.env.example`)

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string (16+ chars). Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS, comma-separated |
| `RAZORPAY_KEY_ID` | Razorpay **test** key id (starts with `rzp_test_`). Optional: leave blank to disable payments |
| `RAZORPAY_KEY_SECRET` | Razorpay test key secret |

**client/.env** (copy from `client/.env.example`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL including `/api`, e.g. `http://localhost:5000/api` |

Never commit `.env` files. They are already in `.gitignore`.

## MongoDB Atlas setup

1. Create a free account and a **free (M0) cluster** at <https://www.mongodb.com/atlas>.
2. **Database Access** → *Add New Database User* (username + password, "Read and write to any database").
3. **Network Access** → *Add IP Address*. Use your current IP for development, or `0.0.0.0/0` while testing a deployment (tighten later).
4. **Database** → *Connect* → *Drivers* → copy the connection string.
5. Replace `<db_user>` / `<db_password>` and add a database name (e.g. `developer-vault`) before the `?`. Paste it as `MONGODB_URI` in `server/.env`. URL-encode special characters in the password.

Collections and indexes are created automatically on first run.

## Installation & running

Requires Node.js 18+.

```bash
# Backend
cd server
cp .env.example .env        # then edit values
npm install
npm run dev                 # http://localhost:5000  (npm start for production)

# Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Optional demo data: `cd server && npm run seed` creates a **separate demo account** (`demo@developervault.dev` / `Demo@1234`) with 7 sample resources. Remove it with `npm run seed:destroy`. Real user data is never touched.

## API endpoints

All responses are `{ "success": true, "data": ... }` or `{ "success": false, "message": "..." }`. Everything except register/login requires `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account, returns `{ user, token }` |
| POST | `/api/auth/login` | Log in, returns `{ user, token }` |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/users/profile` | Update name / email |
| GET | `/api/bookmarks` | List. Query: `search`, `category`, `resourceType`, `favorite=true`, `sort=newest\|oldest\|az\|updated`, `page`, `limit` |
| POST | `/api/bookmarks` | Create |
| GET | `/api/bookmarks/stats` | Dashboard metrics |
| GET | `/api/bookmarks/export` | Download `bookmarks.json` (current user only) |
| POST | `/api/bookmarks/metadata` | `{ url }` → title, description, website, previewImage, favicon |
| GET | `/api/bookmarks/:id` | Read one |
| PUT | `/api/bookmarks/:id` | Update |
| DELETE | `/api/bookmarks/:id` | Delete |
| PATCH | `/api/bookmarks/:id/favorite` | Toggle (or set with `{ favorite: true }`) |
| GET | `/api/categories` | Built-in + custom categories with the user's resource count |
| POST | `/api/categories` | Create a custom category (Pro / Team) |
| DELETE | `/api/categories/:name` | Delete a custom category (its resources move to Other) |
| GET | `/api/billing/status` | Current plan, usage, limits and payment history |
| POST | `/api/billing/order` | Create a Razorpay order for `pro` or `team` |
| POST | `/api/billing/verify` | Verify the payment signature and activate the plan |
| GET | `/api/health` | Health check |

## Authentication explanation

1. **Register**: the API validates input, hashes the password with bcrypt (cost 12), stores the user and returns a signed JWT.
2. **Login**: the password is compared with `bcrypt.compare`. A wrong email or password returns the same generic error.
3. **Session**: the client stores the JWT in `localStorage` and Axios attaches it as a `Bearer` token on every request. A 401 for a logged-in user clears the session and returns them to login.
4. **Protection**: `authMiddleware` verifies the token, loads the user and sets `req.user`. On the client, `ProtectedRoute` guards private pages and `PublicRoute` redirects logged-in users away from login/register.
5. **Data isolation**: every bookmark query includes `userId: req.user._id`, including read-by-id, update, delete, favorite, export and stats. Another user's bookmark id simply returns 404.

## Security notes

- Passwords are never returned (`select: false` + `toJSON` transform); the JWT secret only lives in `.env`.
- Input is sanitized (Mongo `$` operator keys removed, HTML tags stripped), enums are whitelisted, URLs are validated, and stored image/favicon URLs must be http(s).
- The metadata fetcher blocks private/loopback/link-local addresses (SSRF), limits redirects (each hop re-checked), response size and timeout. Note: like most simple guards it checks DNS before connecting, so a hostile DNS server could in theory still race it. Run the API without access to internal networks in production.
- Helmet, CORS allow-list and rate limiting (auth, metadata and general API) are enabled.
- `localStorage` tokens are readable by any script running on the page. This is fine for a capstone, but for a hardened deployment consider httpOnly cookies + CSRF protection.

## Premium plans & payments (Razorpay test mode)

| | Free | Pro (Rs 199 / 30 days) | Team (Rs 499 / 30 days) |
|---|---|---|---|
| Resources | 25 | 500 | Unlimited |
| Tags per resource | 3 | Unlimited | Unlimited |
| Custom categories | No | Unlimited | Unlimited |

Limits are enforced **on the server** (`server/utils/plans.js`), never only in the UI. "Unlimited" still has a hard safety cap (100 tags per resource, 100 custom categories). Team differs from Pro only by the resource cap; shared workspaces are not built.

**How a purchase works**
1. The client calls `POST /api/billing/order`. The server reads the price from its own plan table (the client cannot set the amount) and creates a Razorpay order.
2. Razorpay Checkout opens in the browser and the user pays.
3. The client sends the three signature fields to `POST /api/billing/verify`. The server checks the HMAC-SHA256 signature (`order_id|payment_id`, signed with the key secret), marks the order paid exactly once (replays are rejected) and sets `plan` and `planExpiresAt` (+30 days).
4. A plan only counts while it has not expired. After that the account behaves as Free. Saved resources, tags and categories are never deleted; only creating *new* ones follows the Free limits.

**Setup**
1. Create a free Razorpay account, switch the dashboard to **Test Mode**, then *Account & Settings > API Keys > Generate Test Key*.
2. Put `RAZORPAY_KEY_ID` (starts with `rzp_test_`) and `RAZORPAY_KEY_SECRET` in `server/.env` (and in your host's environment variables when deployed). Restart the server.
3. Log in, open **Billing**, click **Upgrade**. In the payment window use card `4111 1111 1111 1111` with any future expiry and any CVV, or UPI `success@razorpay`. No real money is charged.

The server refuses non-test keys unless `RAZORPAY_ALLOW_LIVE=true` is set. Going live would also need KYC with Razorpay, webhooks (so a paid order is still credited if the user closes the tab before verification), and a hosting plan that allows commercial use.

## Deployment

**Database**: Atlas as above; allow your host's outbound IPs in *Network Access*.

**Backend (Render / Railway / Fly)**
1. Root directory `server`, build command `npm install`, start command `npm start`.
2. Set `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`, `CLIENT_URL=https://<your-frontend-domain>` and (for payments) `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
3. Check `https://<api-host>/api/health`.

**Frontend (Vercel / Netlify)**
1. Root directory `client`, build command `npm run build`, output directory `dist`.
2. Set `VITE_API_URL=https://<api-host>/api` (Vite bakes this in at build time, so redeploy after changing it).
3. SPA routing: Netlify uses the included `public/_redirects`. On Vercel add a `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`.
