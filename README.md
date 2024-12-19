# SkillBridge

A modern freelancer marketplace connecting talented professionals with clients. Built with MERN stack (MongoDB, Express, React, Node.js).

## Overview

SkillBridge serves as a platform where freelancers can showcase their skills and clients can find the perfect talent for their projects. The platform emphasizes clean design, user experience, and secure communications.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm/yarn
- MongoDB Atlas account

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

# Start development server
npm start
```

## Design System

### Colors

```css
- Primary: #222831 (Dark charcoal) - Main brand color
- Secondary: #393E46 (Medium grey) - Supporting elements
- Accent: #00ADB5 (Teal) - Call-to-action elements
- Light: #EEEEEE (Light grey) - Background and contrast
```

### Typography

```css
- Headings: Poppins (400, 500, 600, 700)
- Body: Inter (400, 500, 600)
```

## Features

### For Freelancers

- Professional profile creation
- Skill showcase
- Portfolio management
- Real-time client communication
- Contract management

### For Clients

- Advanced freelancer search
- Filtered talent browsing
- Secure messaging system
- Project posting
- Contract handling

### For Admins

- User management
- Content moderation
- Analytics dashboard
- System monitoring

## Tech Stack

### Frontend

- React (Vite)
- Tailwind CSS
- Material UI
- React Router DOM
- Axios

### Backend

- Node.js
- Express
- MongoDB
- JWT Authentication
- bcrypt

### Development Tools

- ESLint
- Prettier
- PostCSS
- Autoprefixer
- Nodemon

## Project Structure

### Frontend

```
frontend/
├── public/
│   └── logo.svg
├── src/
│   ├── components/
│   │   ├── Home/
│   │   ├── Listings/
│   │   ├── Profile/
│   │   ├── Admin/
│   │   └── shared/
│   ├── pages/
│   ├── assets/
│   ├── utils/
│   └── styles/
```

### Backend

```
server/
├── src/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── utils/
└── app.js
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License
