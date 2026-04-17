# SkillBridge

A modern freelancer marketplace connecting talented professionals with clients. Built with a MERN-based stack using MongoDB, Express, React, and Node.js.

## Overview

SkillBridge serves as a platform where freelancers can showcase their skills, clients can post and manage work, and admins can monitor the health of the platform. The current application includes public discovery pages, protected profile workflows, project lifecycle management, messaging, announcements, ratings, and a growing blog system.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB connection string

### Frontend Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Installation

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file in server root
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# Start development server
npm start
```

## Design System

### Colors

```css
- Primary: #222831 (Dark charcoal) - Main brand and dark-mode base
- Secondary: #393E46 (Medium grey) - Supporting surfaces and UI balance
- Accent: #00ADB5 (Teal) - Call-to-action elements and highlights
- Light: #EEEEEE (Light grey) - Contrast and light theme surfaces
```

### Typography

```css
- Headings: Poppins
- Body: Inter
```

## Features

### For Freelancers

- Professional profile creation with extended profile fields
- Public visibility through freelancer listings and detail pages
- Project interest, assignment, and workflow participation
- Messaging and communication flows
- Ratings and review visibility
- Profile overview with completeness tracking, quick actions, and activity feed

### For Clients

- Advanced freelancer discovery and filtered browsing
- Project posting and project lifecycle management
- Assignment and interested-user workflows
- Secure messaging and collaboration flows
- Review and acceptance flows for submitted work
- Public blog browsing for platform content

### For Admins

- User management and detailed admin user views
- Project moderation and admin project actions
- Announcement management
- KPI, alerts, and dashboard monitoring
- System settings management
- Blog management UI and editorial workflow shell

## Tech Stack

### Frontend

- React 19 with Vite
- Tailwind CSS
- Material UI
- React Router DOM
- Axios
- Framer Motion
- React Icons
- React Toastify
- Sass
- Modal-driven UI patterns

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Multer

### Development Tools

- ESLint
- PostCSS
- Autoprefixer
- Nodemon

## Project Structure

### Frontend

```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Admin/
│   │   ├── Home/
│   │   ├── Listings/
│   │   ├── Profile/
│   │   ├── ProjectDetail/
│   │   └── shared/
│   ├── context/
│   ├── hooks/
│   ├── modal/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── tailwind.config.js
```

### Backend

```
server/
├── app.js
├── package.json
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── utils/
```

## Development Progress [Frontend level]

- ✅ Homepage sections and navigation
- ✅ Listings search and browsing flows
- ✅ Freelancer detail page
- ✅ Login page
- ✅ Signup page
- ✅ Protected profile area
- ✅ Profile overview with completeness flow
- ✅ Profile projects section
- ✅ Profile settings section
- ✅ Profile security section
- ✅ Admin dashboard overview with KPI and alerts support
- ✅ Admin user section and admin user detail view
- ✅ Admin project management workflows
- ✅ Admin announcements management
- ✅ Admin settings section
- ✅ Admin breadcrumbs and navigation improvements
- ✅ Public blog list page
- ✅ Public blog detail page
- ✅ Admin blog management list
- 🚧 Admin blog create and update flow is still in UI-first refinement before full backend hookup

## Development Progress [Backend level]

- ✅ Login and signup endpoints
- ✅ JWT route protection
- ✅ Extended user profile model and update flows
- ✅ Project routes with multiple lifecycle states
- ✅ Messaging routes and controller
- ✅ Announcement routes and controller
- ✅ Ratings routes and controller
- ✅ System config routes and controller
- ✅ Blog model, routes, and controller
- ✅ Seed script for empty databases
- ✅ Additive seed script for appending users and projects
- ✅ Project auto-unlock scheduler
- 🚧 Some new frontend flows, especially the admin blog editor, still need final backend create and update hookup

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License
