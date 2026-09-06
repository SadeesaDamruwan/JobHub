# Job Hub

A full-stack job board connecting **job seekers** and **companies**. Seekers can browse and filter jobs, save listings, and track applications; companies can post jobs and manage their candidate pipeline.

**Stack:** Angular 21 (frontend) · Node.js + Express 5 (backend) · MongoDB Atlas + Mongoose (database)

---

## Project Structure

```
Job Hub/
├── jobhub-app/         # Angular frontend
└── jobhub-backend/      # Express + MongoDB backend
    ├── config/          # DB connection
    ├── controllers/      # Route logic
    ├── middlewares/
    ├── models/           # Mongoose schemas
    ├── routes/            # API route definitions
    ├── scripts/           # e.g. migrateData.js
    └── server.js           # Entry point
```

## Prerequisites

- Node.js (v18+) and npm
- A MongoDB Atlas account with a free (M0) cluster
- Angular CLI (`npm install -g @angular/cli`)
- Postman (for API testing)

## Setup & Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/K-B-R-S-W/Job_Hub.git
cd "Job Hub"
```

### 2. Backend

```bash
cd jobhub-backend
npm install
```

Create a `.env` file in `jobhub-backend/` (this is git-ignored, so it won't be committed):

```
PORT=3000
MONGO_URI=<your MongoDB Atlas connection string>
```

Get `MONGO_URI` from your Atlas cluster: **Database > Connect > Drivers**, copy the connection string, and replace `<password>` with your database user's password.

Start the server:

```bash
npm start
```

The API will run at `http://localhost:3000`. Check it's up:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{ "success": true, "status": "UP", "database": "connected", "uptime": 12.3 }
```

**Optional:** seed sample data with `npm run migrate` (runs `scripts/migrateData.js`).

### 3. Frontend

In a new terminal:

```bash
cd jobhub-app
npm install
ng serve
```

The app will run at `http://localhost:4200` and talk to the backend at `http://localhost:3000` (already whitelisted in the backend's CORS config).

---

## Testing the API with Postman

You can test every endpoint below directly in Postman without the frontend running (just the backend, from step 2).

### Quick start
1. Open Postman → **New → HTTP Request** (or import a collection if you've exported one).
2. Set the method and URL as listed below.
3. For POST/PUT requests, go to the **Body** tab → select **raw** → **JSON**, and paste the example body.
4. Under **Headers**, add `Content-Type: application/json` (Postman usually adds this automatically once you pick raw/JSON).
5. Hit **Send** and check the response against the "Expected Response" status code.

> Tip: create a Postman **Environment** with a variable `baseUrl = http://localhost:3000`, then use `{{baseUrl}}/api/health` etc. in each request — makes it trivial to switch to a deployed URL later.

### 1. System Health Check
`GET {{baseUrl}}/api/health` → confirms the server is up and connected to MongoDB Atlas.

### 2. Job Posts & Feed
| Action | Method | URL |
|---|---|---|
| Fetch all verified jobs (optional filters: `?category=`, `?location=`, `?workMode=`) | GET | `{{baseUrl}}/api/jobs/all` |
| Create a new job post | POST | `{{baseUrl}}/api/jobs` |
| Get single job details | GET | `{{baseUrl}}/api/jobs/single/:id` |

Example body for **Create a job post**:
```json
{
  "title": "Senior Frontend Engineer",
  "company": "PixelForge Studios",
  "location": "Colombo, Sri Lanka",
  "type": "Full-Time",
  "workMode": "Hybrid",
  "category": "Tech & Engineering",
  "level": "Senior Level",
  "stipend": "Rs 150,000 / mo",
  "deadline": "2026-10-15",
  "description": "Looking for an experienced Angular & React developer with strong UI/UX sensibilities."
}
```

### 3. Job Seeker Authentication & Profile
| Action | Method | URL |
|---|---|---|
| Register | POST | `{{baseUrl}}/api/seeker/register` |
| Login | POST | `{{baseUrl}}/api/seeker/login` |
| Complete / update profile | POST | `{{baseUrl}}/api/seeker/complete-profile` |
| Get profile | GET | `{{baseUrl}}/api/seeker/profile/:email` |

Example body for **Register**:
```json
{ "fullName": "Kasun Perera", "email": "kasun@example.com", "password": "Password123!" }
```

### 4. Saved Jobs & Bookmarks
| Action | Method | URL |
|---|---|---|
| Save a job | POST | `{{baseUrl}}/api/seeker/saved-jobs` |
| Get saved job details | GET | `{{baseUrl}}/api/seeker/saved-jobs-details/:email` |
| Remove a saved job | DELETE | `{{baseUrl}}/api/seeker/saved-jobs/:email/:jobId` |

### 5. Applications & Candidate Pipeline
| Action | Method | URL |
|---|---|---|
| Submit an application | POST | `{{baseUrl}}/api/applications/apply` |
| Get a seeker's applications | GET | `{{baseUrl}}/api/applications/my-applications?email=` |
| Get a company's applicants | GET | `{{baseUrl}}/api/applications/employer-applicants?company=` |
| Update applicant status | PUT | `{{baseUrl}}/api/applications/update-status/:id` |

Example body for **Update applicant status**:
```json
{ "status": "Interview", "employerFeedback": "Interview scheduled for Tuesday at 10:00 AM via Google Meet." }
```

### 6. Company Authentication & Settings
| Action | Method | URL |
|---|---|---|
| Company login | POST | `{{baseUrl}}/api/company/login` |
| Get company profile | GET | `{{baseUrl}}/api/company-details/profile?email=` |

### Saving your Postman work for submission
Once your requests are set up, go to your collection's **⋯ menu → Export**, save it as `Job_Hub.postman_collection.json`, and commit it into the repo (e.g. under a `/postman` folder) so it's part of your Assignment 03 submission alongside the screenshots.

---
