# LabTrack – Laboratory Equipment & Resource Management System

A web application for managing college laboratory equipment, bookings, and roles.

## Technologies
HTML, CSS, JavaScript, AngularJS 1.8.3, Node.js, Express.js, MongoDB, Mongoose

## Features
- Equipment inventory with search, filter, add, edit, and delete
- Registration and login with hashed passwords (bcryptjs) and sessions (express-session)
- Three roles: admin, assistant, student
- Booking requests with double-booking protection
- Approve, reject, and cancel workflow
- Live dashboard statistics
- Responsive design

## Setup
1. Install Node.js and MongoDB Community Server (and start MongoDB).
2. Open a terminal in the `backend` folder and run:
       npm install
3. Create `backend/.env`:
       PORT=5000
       NODE_ENV=development
       MONGODB_URI=mongodb://127.0.0.1:27017/labtrack
       SESSION_SECRET=<64 random characters>
   Generate the secret with:
       node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
4. Load sample data:
       npm run seed
       npm run seed:users
5. Start the server:
       npm run dev
6. Open http://localhost:5000

## Sample accounts (local testing only)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@labtrack.edu | Admin@123 |
| Assistant | assistant@labtrack.edu | Assist@123 |
| Student | student@labtrack.edu | Student@123 |

## Project structure
    backend/
      config/db.js          MongoDB connection
      middleware/auth.js    requireLogin, requireRole
      models/               User, Equipment, Booking
      routes/               auth, equipment, bookings, stats
      seed.js, seedUsers.js sample data scripts
      server.js             Express app
    frontend/
      index.html            homepage and equipment table
      login.html            login and register
      bookings.html         booking screens
      css/style.css
      js/                   app.js, services/, controllers/, vendor/

## API summary
| Method | URL | Access |
|--------|-----|--------|
| POST | /api/auth/register, /login, /logout | public |
| GET | /api/auth/me | logged in |
| GET | /api/equipment, /api/equipment/:id | public |
| POST, PUT, DELETE | /api/equipment | admin, assistant |
| GET, POST | /api/bookings | logged in (students see own) |
| PUT | /api/bookings/:id/review | admin, assistant |
| PUT | /api/bookings/:id/cancel | owner or staff |
| GET | /api/stats | public |

## Security notes
- Passwords are hashed with bcrypt; they are never returned by the API.
- Sessions use an HttpOnly cookie.
- Role checks are enforced on the server, not just hidden in the UI.
- Helmet sets security headers. AngularJS runs in CSP mode (ng-csp).
- Registration always creates students; the role cannot be chosen by the client.

## Known limitations
- Sessions are kept in server memory (users are logged out when the server restarts).
- Maintenance records and usage reports are not implemented.