# TaskPlanet Social Feed

A mini social post application inspired by TaskPlanet's social page.

## Tech Stack
- **Frontend**: React.js + Material UI (MUI)
- **Backend**: Node.js + Express
- **Database**: MongoDB

## Prerequisites
- Node.js (v16+)
- MongoDB running locally on port 27017

## Setup & Run

### 1. Start MongoDB
Make sure MongoDB is running locally.

### 2. Start the Backend
```bash
cd server
npm install
npm run dev
```
Server runs on http://localhost:5000

### 3. Start the Frontend
```bash
cd client
npm install
npm start
```
App runs on http://localhost:3000

## Features
- Signup / Login with JWT authentication
- Create posts with text, image, or both
- Public feed with pagination (10 posts per page)
- Like / Unlike posts (toggle)
- Comment on posts
- Real-time UI updates on like and comment
- Responsive layout

## Project Structure
```
TaskPlanet/
├── server/
│   ├── models/       # User.js, Post.js
│   ├── routes/       # auth.js, posts.js
│   ├── middleware/   # auth.js (JWT)
│   ├── uploads/      # uploaded images
│   └── index.js
└── client/
    └── src/
        ├── api/        # axios instance
        ├── context/    # AuthContext
        ├── components/ # Navbar, CreatePost, PostCard
        └── pages/      # Feed, Login, Signup
```
