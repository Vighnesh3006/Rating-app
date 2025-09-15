# Store Rating Web Application – FullStack Intern Challenge

## Project Overview
This is a **Store Rating Web Application** built using **Express.js (Backend)**, **MySQL (Database)**, and **React.js (Frontend)**.

Users can register, log in, and submit ratings (1–5) for stores. Functionalities depend on user roles:

- **Admin**: Manage stores and users, view dashboards  
- **Normal User**: Sign up, view stores, submit and update ratings  
- **Store Owner**: View ratings for their store, see average rating

---

## Features

### Admin
- Add new stores, normal users, and admin users  
- Dashboard showing total users, stores, and ratings  
- View, filter, and manage all users and stores  

### Normal User
- Sign up and log in  
- View all registered stores  
- Submit and modify ratings  
- Search stores by name or address  
- Update password  

### Store Owner
- Log in  
- View list of users who submitted ratings for their store  
- See average rating of their store  
- Update password  

---

## Tech Stack
- **Backend**: Node.js + Express.js  
- **Database**: MySQL  
- **Frontend**: React.js  
- **Authentication**: JWT  
- **Password Security**: bcryptjs  

---

## Project Structure
```text
fullstack-assignment/
│
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── routes/users.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── components/
│   └── package.json
│
└── README.md
```

---

## Setup Instructions

### Backend

cd backend
npm install
Start backend server:
node server.js
Frontend
cd frontend
npm install
npm start

### Default Credentials

## Admin
Email: vighneshghorpade007@gmail.com
Password: vighnesh@123


## Store Owner (Example)

Email: santoshpatil@gmail.com
Password: Santoshpatil@123

### Database Schema

## Users Table

id | name | email | password | address | role


## Stores Table

id | name | address | owner_id


## Ratings Table

id | user_id | store_id | rating


### Include a backend/db.sql file for creating tables and inserting default users.

Notes
- Name must be 20–60 characters
- Address max 400 characters
- Password: 8–16 characters, at least one uppercase and one special character
- Email must follow standard email format
- Tables support sorting for key fields like Name, Email, and Address
- JWT token required for accessing protected routes


This project fulfills the requirements for the FullStack Intern Coding Challenge
