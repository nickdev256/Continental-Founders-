# Continental Founders Backend

A production-ready starter backend for the Continental Founders React/Vite website.

## Included

- Contact form API
- Partnership inquiry API
- Newsletter subscribe/unsubscribe API
- MongoDB persistence
- Admin login with JWT
- Admin dashboard stats
- Admin listing/status updates for contact and partnership submissions
- Newsletter subscriber list for admin
- Optional Gmail/SMTP notifications
- CORS, Helmet, rate limiting, validation, centralized errors

## 1. Requirements

- Node.js 18+
- MongoDB locally or MongoDB Atlas
- Gmail App Password if email notifications are enabled

## 2. Install

```bash
npm install
```

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Edit `.env` with your own MongoDB URI, JWT secret, admin credentials and email settings.

## 3. Start

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Health check:

```text
GET http://localhost:5000/api/health
```

## 4. Public API

### Contact

`POST /api/contact`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+256...",
  "organization": "Example University",
  "subject": "Program inquiry",
  "message": "I would like to learn more about your programs."
}
```

### Partnership inquiry

`POST /api/partnerships`

```json
{
  "organization": "Example University",
  "contactName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+256...",
  "organizationType": "University",
  "website": "https://example.org",
  "areaOfInterest": "Entrepreneurship",
  "message": "We are interested in collaborating."
}
```

### Newsletter subscribe

`POST /api/newsletter/subscribe`

```json
{
  "email": "jane@example.com",
  "firstName": "Jane"
}
```

### Newsletter unsubscribe

`POST /api/newsletter/unsubscribe`

```json
{
  "email": "jane@example.com"
}
```

## 5. Admin API

### Login

`POST /api/auth/login`

```json
{
  "email": "your-admin-email",
  "password": "your-admin-password"
}
```

Use the returned JWT as:

```text
Authorization: Bearer YOUR_TOKEN
```

### Current admin

`GET /api/auth/me`

### Dashboard stats

`GET /api/admin/dashboard/stats`

### Contacts

`GET /api/contact`

`PATCH /api/contact/:id/status`

```json
{ "status": "read" }
```

Valid statuses: `new`, `read`, `replied`, `closed`.

### Partnerships

`GET /api/partnerships`

`PATCH /api/partnerships/:id/status`

```json
{ "status": "reviewing" }
```

Valid statuses: `new`, `reviewing`, `contacted`, `approved`, `declined`.

### Subscribers

`GET /api/newsletter`

## 6. Gmail setup

Do not use your normal Google account password in `.env`.

Once `continentalfounders.info@gmail.com` is created:

1. Enable 2-Step Verification on the Google account.
2. Create an App Password for the backend.
3. Put that App Password in `EMAIL_APP_PASSWORD`.
4. Keep `.env` out of Git. `.gitignore` already excludes it.

If SMTP credentials are not configured, the website forms still save submissions to MongoDB; only the email notification is skipped.

## 7. Connect the React/Vite frontend

Copy `frontend-snippets/api.js` into your frontend, for example:

```text
src/services/api.js
```

Create a frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For deployment, replace it with the production backend URL.

## 8. Recommended deployment

Frontend: Vercel, Netlify, or Bluehost-compatible static hosting.

Backend: Render, Railway, Fly.io, VPS, or another Node.js host.

Database: MongoDB Atlas.

Set all `.env` values in your hosting provider's environment-variable settings rather than committing secrets to GitHub.
