# EduLead — Admission Lead Management System

EduLead is an Admission Lead Management System developed for the **Edumerge Solutions Pre-Drive Product Engineering Assignment — Assignment 5**.

The system helps educational institutions manage admission leads from initial capture through counselling, follow-ups, application progress, and conversion.

## Problem Statement

Educational institutions receive admission enquiries from multiple sources such as websites, walk-ins, phone calls, WhatsApp, education fairs, campaigns, and referrals.

EduLead provides a centralized system to manage these leads, assign them to counsellors, track interactions and follow-ups, monitor the admission pipeline, and provide management-level visibility through dashboards and reports.

## Key Features

### Lead Management

* Create and manage admission leads
* Track lead name, contact details, course preference, source, intake, and notes
* Track lead lifecycle status
* Assign leads to counsellors
* View individual lead details
* Maintain lead activity history

### Lead Lifecycle

The system supports the following lead statuses:

* New
* Contacted
* Interested
* Follow-up
* Application
* Converted
* Not Interested

### Follow-up Management

* Schedule follow-ups for leads
* Support Call, WhatsApp, Email, and Meeting follow-up types
* Track Pending, Completed, and Missed follow-ups
* Record follow-up notes
* Track completion time
* View follow-up details

### Authentication & Authorization

* JWT-based authentication
* Manager and Counsellor roles
* Protected application routes
* Role-based API authorization
* Counsellors can access only their assigned leads and follow-ups
* Managers can view and manage overall admission data

### Dashboard

* Total leads
* New leads
* Contacted leads
* Interested leads
* Applications
* Converted leads
* Pending and missed follow-ups
* Lead status distribution
* Lead source distribution
* Today's follow-ups

### Reports & Insights

* Total leads
* Converted leads
* Conversion rate
* Status breakdown
* Source breakdown
* Follow-up performance
* Lead ageing analysis

### Responsive UI

* Desktop layout
* Tablet support
* Mobile responsive layout
* Hamburger navigation for smaller screens

## Technology Stack

### Frontend

* React.js
* Vite
* React Router
* Axios
* HTML5
* CSS3

### Backend

* Node.js
* Express.js
* JWT
* MySQL
* mysql2

### Development Tools

* Visual Studio Code
* Git
* GitHub
* Postman
* XAMPP / MySQL

## Architecture

EduLead follows a client-server architecture.

```text
┌─────────────────────────────┐
│       React Frontend        │
│                             │
│ Login / Dashboard / Leads   │
│ Follow-ups / Reports        │
└──────────────┬──────────────┘
               │
             Axios
               │
               ▼
┌─────────────────────────────┐
│       Express Backend       │
│                             │
│ Routes → Middleware →       │
│ Controllers → Database      │
└──────────────┬──────────────┘
               │
             SQL
               │
               ▼
┌─────────────────────────────┐
│          MySQL              │
│                             │
│ Users                       │
│ Leads                       │
│ Follow-ups                  │
│ Lead Activities             │
└─────────────────────────────┘
```

## Main Backend Modules

```text
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── leadController.js
│   ├── activityController.js
│   ├── followupController.js
│   ├── dashboardController.js
│   └── reportController.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── routes/
│   ├── authRoutes.js
│   ├── leadRoutes.js
│   ├── activityRoutes.js
│   ├── followupRoutes.js
│   ├── dashboardRoutes.js
│   └── reportRoutes.js
└── server.js
```

## Main Frontend Modules

```text
frontend/
└── src/
    ├── api/
    ├── components/
    ├── pages/
    ├── App.jsx
    └── main.jsx
```

## User Roles

### Manager

Managers have organization-level visibility and can:

* View all leads
* Assign leads to counsellors
* Update lead information
* View all follow-ups
* Manage follow-up assignments
* View dashboard statistics
* View reports and ageing information

### Counsellor

Counsellors can:

* View their assigned leads
* Create leads that are automatically assigned to themselves
* Update their assigned leads
* Add lead activities
* Create and manage follow-ups for their assigned leads
* View their relevant dashboard information

## Database Design

The application uses MySQL with the following primary tables:

### users

Stores application users and their roles.

### leads

Stores admission lead information, source, status, counsellor assignment, intake preference, notes, and follow-up timestamps.

### followups

Stores scheduled interactions with leads, including date, time, type, notes, counsellor, and status.

### lead_activity

Stores the history of interactions and activities performed against leads.

## Important Assumptions

1. Each lead can be assigned to one counsellor at a time.
2. A counsellor can access only leads assigned to that counsellor.
3. Managers have organization-level visibility.
4. A counsellor-created lead is automatically assigned to that counsellor.
5. Follow-up status is separate from lead lifecycle status.
6. Lead ageing is calculated using the lead creation date.
7. Converted and Not Interested leads are excluded from active lead ageing.
8. JWT tokens are used to protect authenticated API resources.

## Key Engineering Decisions

### JWT Authentication

JWT was selected to provide stateless authentication between the React client and Express API.

### Role-Based Middleware

Authorization is handled separately from authentication so that API resources can enforce Manager/Counsellor permissions consistently.

### Reusable Sidebar

A reusable Sidebar component was introduced so that navigation behavior and responsive mobile navigation remain consistent across application pages.

### Axios Interceptor

A shared Axios instance automatically attaches the JWT token to authenticated API requests.

### MySQL

MySQL was selected because the admission lead system contains structured relational data such as users, leads, follow-ups, and activities with clear relationships.

## Trade-offs

### Localhost Configuration

The current implementation is configured for local development using MySQL and an Express server. This keeps the assignment setup simple and easy to demonstrate.

### Authentication Storage

The JWT is stored in browser local storage for this prototype. A production system could use a more hardened authentication approach such as secure, HTTP-only cookies depending on the deployment architecture.

### Lead Assignment

The current implementation supports one active counsellor assignment per lead. A larger production system could support assignment history and reassignment audit trails.

### Reporting

The current reporting layer focuses on operational admission metrics. A production implementation could extend this with configurable date ranges, campaign ROI, counsellor performance metrics, and advanced funnel analytics.

## Validation & Edge Cases

The application was tested for:

* Required lead fields
* Valid and invalid login credentials
* JWT-protected routes
* Unauthorized API access
* Manager versus counsellor permissions
* Counsellor lead ownership
* Lead creation and update
* Lead activity creation
* Follow-up ownership
* Follow-up status changes
* Pending → Completed
* Pending → Missed
* Protected frontend routes
* Logout and subsequent protected-route access
* Dashboard statistic updates
* Report consistency
* Responsive navigation
* Production frontend build

The frontend production build was successfully verified using:

```bash
npm run build
```

## Local Setup

### Prerequisites

* Node.js
* npm
* MySQL
* XAMPP or another MySQL environment

### Backend

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file containing the required database and server configuration.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=edulead
DB_PORT=3306
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

Start the backend:

```bash
node server.js
```

### Frontend

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend communicates with the Express API running on port `5000`.

## Security Note

The `.env` file is intentionally excluded from version control.

Do not commit database credentials, JWT secrets, or other environment-specific secrets to the repository.

## AI / Tool Usage

AI-assisted development was used during implementation, primarily for:

* Code structure and implementation assistance
* Debugging and troubleshooting
* API and authentication development
* React component development
* Responsive UI implementation
* Validation and testing guidance
* Documentation preparation

AI-generated suggestions were manually reviewed and tested against the running application before being retained.

A detailed AI Usage Report is included as part of the assignment submission documentation.

## Project Status

The application is implemented as a working prototype covering the core admission lead management workflow, including authentication, role-based access, lead management, activities, follow-ups, dashboard metrics, reports, ageing, and responsive navigation.
