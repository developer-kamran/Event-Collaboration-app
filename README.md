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

## 🚀 Features

### 🔐 Authentication & Authorization

- **Secure user registration and login**
- **JWT-based authentication** using access and refresh tokens
- **Password hashing** with bcrypt
- **Role-Based Access Control (RBAC)** to protect routes and resources

#### 👥 Supported Roles

- **Organizer**
- **Manager**
- **Volunteer**
- **Attendee**

#### 🔒 Role Permissions

| Role          | Permissions                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| **Organizer** | Full control over events, create/update/delete events, manage collaborators |
| **Manager**   | Assign and manage tasks, manage attendee registrations                      |
| **Volunteer** | View and update only assigned tasks                                         |
| **Attendee**  | Register for events, view event details, submit feedback                    |

### 📅 Event Management

- **Create, edit, and delete events**
- **Event lifecycle management** with statuses:
  - Draft
  - Published
  - Completed
- **Event attributes** include:
  - Title and description
  - Date and time
  - Location (online or offline)
  - Maximum attendee limit
- **Public event pages** for attendee discovery and registration

### 🤝 Team Collaboration

- **Invite collaborators** to events via email
- **Accept or reject** event invitations
- **Assign collaborator roles** (Organizer, Manager, Volunteer)
- **View and manage** the collaborator list for each event

### ✅ Task Management

- **Create and manage tasks** within an event
- **Assign tasks** to collaborators
- **Track task progress** with statuses:
  - Pending
  - In Progress
  - Completed
- **Task properties** include:
  - Title and description
  - Assigned collaborator
  - Due date
- **Permission-based task updates** (volunteers can update only their tasks)

### 🎟️ Attendee Registration

- **Attendee registration form** for public events
- **Automatic enforcement** of maximum attendee limits
- **Organizer and Manager access** to attendee lists
- **Secure attendee data storage**

## 🚀 Advanced Features

### 📧 Email & In-App Notifications

- **Automated email notifications** using Nodemailer:
  - Event invitations
  - Registration confirmations
  - Event reminders (24 hours before start)
- **In-app notification system** with persistent storage and APIs

### 🗓️ Calendar Integration

- **Unified calendar view** using FullCalendar
- **Displays**:
  - Events the user is participating in
  - Task deadlines
- **Calendar data synced** dynamically from backend APIs

### 📱 QR Code Check-In System

- **Unique QR code generated** for each attendee upon registration
- **QR code securely encodes** attendee and event information
- **Organizer scans QR codes** to mark attendees as checked-in
- **Duplicate check-ins** are automatically prevented

### ⭐ Feedback & Ratings

- **Attendees can submit feedback** after event completion
- **Star-based rating system** (1–5)
- **Optional textual feedback**
- **Organizers can view**:
  - Aggregated event ratings
  - Detailed feedback lists for analysis

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
