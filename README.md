# SmartEvent – Event Discovery & Ticket Booking System

SmartEvent is a full-stack event discovery and ticket booking platform built with FastAPI and React. Users can discover events, book tickets, receive QR-based digital tickets and notifications, and verify tickets. Organizers can manage their events and monitor performance, while administrators can view platform-wide analytics.

## 🚀 Technology Stack

**Backend**

* Python and FastAPI
* SQLAlchemy ORM
* SQLite
* Pydantic
* JWT authentication
* Password hashing
* QR code generation using `qrcode`
* Pytest

**Frontend**

* React and Vite
* React Router
* Axios
* Tailwind CSS
* React Toastify
* Recharts for analytics charts

## ✨ Project Modules: 1–11

### Phase 1 — Core Event Booking System (Modules 1–6)

#### Module 1: User Authentication

* User registration and login
* Password hashing
* JWT access-token authentication
* Protected API routes
* Current-user profile
* Axios authorization interceptor

#### Module 2: Event Discovery

* Browse and view event details
* Search events
* Filter events by category
* Display event information, location, date, price, and ticket availability

#### Module 3: Ticket Booking

* Book tickets for available events
* Validate ticket quantity and availability
* Calculate booking totals
* Update remaining ticket availability
* View booking history
* Track booking status

#### Module 4: QR Code Digital Tickets

* Generate unique digital ticket codes
* Generate QR codes for tickets
* Display ticket and booking details
* View and download digital tickets

#### Module 5: Ticket Verification

* Verify tickets using their unique codes
* Display ticket and event details
* Reject invalid or nonexistent ticket codes

#### Module 6: Notifications and Event Reminders

* Booking notifications
* Notification list and unread count
* Mark notifications as read
* Upcoming-event reminders
* Prevent duplicate reminder notifications for the same booking/event

### Phase 2 — Management, Authorization and Analytics (Modules 7–11)

#### Module 7: Role-Based Access Control (RBAC)

* Support USER, ORGANIZER, and ADMIN roles
* Protect endpoints according to user roles
* Restrict organizers to their own event-management operations
* Provide role-specific dashboards and navigation

#### Module 8: Organizer Event Management

* Create and manage events
* Update event details
* Validate event ownership
* Manage ticket capacity
* View bookings for organizer-owned events

#### Module 9: Organizer Dashboard and Booking Insights

* View organizer-owned events
* Track tickets sold and remaining
* Monitor booking counts and revenue
* Display event-level performance summaries
* Visualize event metrics with charts

#### Module 10: Event Status and Updates

* Support UPCOMING, ONGOING, COMPLETED, and CANCELLED statuses
* Update event lifecycle according to event dates
* Notify users about relevant event updates and cancellations
* Display event statuses and notifications in the frontend

#### Module 11: Admin Dashboard and Analytics

* View total users and events
* Monitor tickets sold, bookings, and revenue
* Analyze daily ticket sales
* View monthly booking trends
* Identify popular events and top-revenue events
* Support date-based analytics filtering where implemented
* Provide administrator-protected management functionality

## 👥 User Roles

| Role      | Main responsibilities                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| USER      | Discover events, book tickets, view bookings and tickets, receive notifications, and verify ticket codes               |
| ORGANIZER | Create and manage own events, review bookings, and monitor ticket sales and revenue                                    |
| ADMIN     | Access the admin dashboard and platform analytics, with administrative permissions for supported management operations |

## 🔐 Authentication Flow

1. Register an account and log in.
2. The backend issues a JWT access token.
3. The frontend stores the token in browser local storage.
4. Axios attaches the token as a Bearer authorization header.
5. Protected endpoints validate the token and enforce applicable permissions.

## 🎟️ Booking and Ticket Flow

1. Log in and browse events.
2. Select an event and ticket quantity.
3. Validate availability and calculate the total.
4. Create the booking and update ticket availability.
5. Generate a digital ticket and QR code for a confirmed booking.
6. View or download the ticket.
7. Verify the ticket using its unique code.

## 🔔 Notification Flow

Notifications may be generated for booking confirmations, event updates, cancellations, and upcoming-event reminders, according to the implemented notification rules.

Users can view notifications, check unread counts, and mark notifications as read.

## 📊 Dashboards and Reporting

### Organizer Dashboard

* Event and ticket totals
* Tickets sold and remaining
* Booking counts
* Revenue summaries
* Event performance charts and tables

### Admin Dashboard

* Total users
* Total events
* Tickets sold
* Total bookings
* Total revenue
* Daily sales and booking trends
* Monthly booking analytics
* Popular events and top-revenue events

## 📁 Project Structure

The following is a representative structure. Adjust it to match the actual repository contents before publishing.

```text
SmartEvent/
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── dependencies.py
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── README.md
└── .gitignore
```

## ⚙️ Installation and Setup

### Prerequisites

* Python version supported by the project's dependencies
* Node.js and npm

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd SmartEvent
```

Replace `YOUR_REPOSITORY_URL` with the actual GitHub repository URL.

### 2. Set up the backend

Open a terminal in the backend directory:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

Create a `backend/.env` file with suitable local configuration:

```env
DATABASE_URL=sqlite:///./smartevent.db
SECRET_KEY=replace-with-a-strong-random-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Use the variable names expected by the application. Never publish real secrets.

Start the backend from the backend directory:

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --app-dir .
```

Backend URL: `http://127.0.0.1:8000`

Swagger documentation: `http://127.0.0.1:8000/docs`

ReDoc documentation: `http://127.0.0.1:8000/redoc`

### 3. Set up the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

Ensure the frontend API base URL points to the running backend and matches the API prefix configured by the application.

## 🧪 Testing

Run available backend tests from the backend directory:

```powershell
.\venv\Scripts\python.exe -m pytest
```

Test coverage should include, where implemented:

* Registration, login, and protected endpoints
* Event search and category filtering
* Booking creation and ticket availability
* QR ticket generation and verification
* Notification delivery and reminder deduplication
* Role permissions and event ownership
* Organizer dashboard metrics
* Admin dashboard and analytics
* Event status changes and cancellation notifications

Manual end-to-end testing has been performed on core booking workflows and key Phase 2 dashboards and notifications. Run the automated test suite before making any broader claims about test coverage.

## 🔒 Security and Repository Hygiene

* Do not commit `.env` files or real credentials.
* Never publish secret keys or access tokens.
* Do not commit virtual environments, `node_modules`, build output, cache files, or local databases containing test data.
* Use `.gitignore` to exclude generated and sensitive files.
* Enforce authentication, authorization, and ownership checks on protected operations.
* Keep any demo accounts and passwords out of the public README.

## 📌 Project Status

SmartEvent covers the core event booking workflow and the Phase 2 management and analytics enhancements across Modules 1–11. Core booking features and selected Phase 2 dashboards and notifications have been tested locally.

## 👩‍💻 Developer

**Lavanya D**

Project: **SmartEvent – Event Discovery & Ticket Booking System**
