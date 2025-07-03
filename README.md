# Schedule App Frontend

*A user interface for managing appointments, employees, and services, as well as booking new appointments.*

## Table of Contents

1. [Demo](#demo)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Usage](#usage)
6. [Contact](#contact)

---

## Demo

Try the live demo: [https://sheduleapp.netlify.app](https://sheduleapp.netlify.app)

## Features

* **Book Appointments**: Intuitive form to select service, date, time slot, and preferred employee.
* **My Appointments**: View all booked appointments in one place.
* **Edit Profile**: Update personal information and preferences.
* **Responsive Design**: Optimized for both desktop and mobile devices.

### Admin Section

1. **Manage Services**: Create, edit, and delete available services.
2. **Manage Employees**: Add, edit, and remove employees; assign them to services.

### Employee Section

1. **Availability Blocks**: Define, edit, and delete availability blocks.
2. **View Appointments**: See upcoming appointments assigned to the employee.

## Tech Stack

* **Frontend**: React 18, React Router
* **Authentication**: Passport.js
* **Backend**: Node.js, Express
* **Validation**: express-validator
* **Database**: PostgreSQL

## Getting Started

To run both parts of the app, clone and start **frontend** and **backend** in two separate terminals:

```bash
# Frontend
git clone https://github.com/FedericoRojo/schedule_app_frontend.git
cd schedule_app_frontend
npm install
npm run dev
```

```bash
# Backend
git clone https://github.com/FedericoRojo/schedule_app_backend.git
cd schedule_app_backend
npm install
npm start
```

Make sure to configure environment variables in each project’s `.env` file with your database credentials and API URL.

## Usage

1. Sign up a new user through the UI.
2. In your PostgreSQL console, grant **admin** role to the new user, e.g.:

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
   ```
3. Log in with the **admin** account and:

   * Add services under **Admin → Services**.
   * Add employees and set up availability under **Admin → Employees**.
4. Create a regular user via **Admin → Users** (or allow public registration).
5. Log in as a regular user to book appointments by selecting service, employee, date, and time.

## Contact

**Federico Rojo**

* Email: [federojo10@gmail.com](mailto:federojo10@gmail.com)
