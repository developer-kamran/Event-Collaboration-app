# Event Collaboration Application (MERN)

Production-ready MERN stack app for event collaboration: create events, invite collaborators, manage tasks, register attendees, QR check-in, feedback, and calendar view.

## Tech Stack

- **Frontend:** React (Vite), shadcn/ui, Tailwind CSS, Redux Toolkit, React Router, FullCalendar, qrcode.react, Recharts
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT (access + refresh tokens), bcrypt
- **Email:** Nodemailer
- **Roles:** Organizer, Manager, Volunteer, Attendee (RBAC)

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT secrets, optional email
npm install
npm run dev
```

Server runs at `http://localhost:5000`. API base: `http://localhost:5000/api`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` and proxies `/api` to the backend.

### Environment (Backend `.env`)

- `PORT` – default 5000
- `MONGODB_URI` – MongoDB connection string
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` – JWT signing secrets
- `FRONTEND_URL` – e.g. `http://localhost:5173` (CORS & email links)
- Optional: `EMAIL_*` for Nodemailer (e.g. Ethereal for dev)
- Optional: `QR_SECRET` for QR payload signing

## Features

- **Auth:** Register, login, JWT refresh, logout, role-based access
- **Events:** CRUD, draft/published/completed, online/offline, max attendees
- **Collaboration:** Invite by email, accept/reject, assign roles (manager/volunteer)
- **Tasks:** Create/assign tasks, status (pending/in_progress/completed), due dates
- **Attendees:** Public registration form, list, max limit, QR code per registration
- **QR Check-in:** Encrypted QR per attendee, organizer check-in, no duplicate check-in
- **Notifications:** In-app list, mark read; emails for invitation, registration, reminder (configure Nodemailer)
- **Calendar:** FullCalendar with events and task deadlines (sync from API)
- **Feedback:** Attendees submit rating (1–5) and comment; organizers see list and aggregated stats (Recharts)

## API Overview

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/events`, `GET /api/events/public`, `GET /api/events/public/:id`, `GET /api/events/calendar`, `POST /api/events`, `GET /api/events/:id`, `PUT /api/events/:id`, `DELETE /api/events/:id`
- `POST /api/invitations/:eventId/invite`, `GET /api/invitations/:eventId`, `GET /api/invitations/token/:token`, `POST /api/invitations/token/:token/accept`, `POST /api/invitations/token/:token/reject`
- `GET /api/tasks/:eventId`, `POST /api/tasks/:eventId`, `GET /api/tasks/:eventId/:taskId`, `PUT /api/tasks/:eventId/:taskId`, `DELETE /api/tasks/:eventId/:taskId`
- `POST /api/attendees/:eventId/register`, `GET /api/attendees/:eventId`, `POST /api/attendees/:eventId/check-in`, `GET /api/attendees/:eventId/:attendeeId/qr`
- `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`
- `POST /api/feedback/:eventId/:attendeeId`, `GET /api/feedback/:eventId`, `GET /api/feedback/:eventId/attendee/:attendeeId`

## Public URLs

- **Event registration (no auth):** `/e/:eventId` – e.g. `http://localhost:5173/e/EVENT_ID`
- **Invitation accept:** `/invitations/:token` – link sent by email
- **Submit feedback (attendee):** `/e/:eventId/feedback/:attendeeId`

## Event reminder (24h before)

Backend supports sending reminders via `sendEventReminder` in `services/emailService.js`. For production, run a cron job (e.g. `node-cron` or external scheduler) that finds events with `date` in the next 24 hours and calls the email service for each registered attendee.

## License

MIT
