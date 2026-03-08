# WhatsApp Clone

A full-stack real-time messaging application built with Node.js/Express backend and React frontend, featuring instant messaging, video calls, status updates, and user authentication.

## Overview

This project is a WhatsApp-like application that demonstrates modern web development practices with real-time communication, responsive UI, and secure authentication. The application supports multiple users, real-time messaging via WebSockets, file uploads, and multimedia sharing.

## Features

### Core Messaging
- Real-time instant messaging with Socket.io
- Message history and search functionality
- Typing indicators and online status
- Read receipts and message timestamps

### User Management
- Secure user registration and authentication
- JWT-based session management
- OTP verification for account security
- User profile management
- Contact list management

### Media & Files
- Image uploads via Cloudinary
- File sharing and downloads
- Status/Stories feature (similar to WhatsApp)
- Avatar and profile picture support

### Communications
- Video calling integration (Twilio)
- Phone notifications (SMS via Twilio)
- Email notifications (Nodemailer)
- Real-time notifications

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark and light theme support
- Smooth animations and transitions
- Intuitive user interface
- Real-time updates

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Video**: Twilio
- **Utilities**: Multer, Mongoose, CORS

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Real-time**: Socket.io Client
- **HTTP**: Axios
- **Forms**: React Hook Form + Yup
- **Notifications**: React Toastify
- **Animation**: Framer Motion
- **Icons**: React Icons
- **Date**: Date-fns

## Project Structure

```
What'sApp/
├── Backend/
│   ├── Controllers/          # Request handlers
│   ├── Database/             # MongoDB configuration
│   ├── Middleware/           # Express middleware
│   ├── Models/               # MongoDB schemas
│   ├── Routes/               # API endpoints
│   ├── Services/             # Business logic
│   ├── Utils/                # Utilities
│   ├── uploads/              # Uploaded files
│   ├── app.js                # Express app
│   ├── server.js             # Server entry point
│   ├── package.json
│   └── Readme.md
│
└── Frontend/
    ├── src/
    │   ├── Components/       # React components
    │   ├── Pages/            # Page components
    │   ├── Services/         # API services
    │   ├── Store/            # Zustand stores
    │   ├── Utils/            # Utilities
    │   ├── hooks/            # Custom hooks
    │   ├── images/           # Assets
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/logout` - Logout user

### Chat
- `GET /api/chats` - Get all conversations
- `POST /api/chats/create` - Create new conversation
- `GET /api/chats/:id` - Get conversation details
- `POST /api/chats/:id/message` - Send message
- `GET /api/chats/:id/messages` - Get messages

### Status
- `GET /api/status` - Get all status updates
- `POST /api/status/create` - Create status
- `GET /api/status/:id` - Get status details
- `DELETE /api/status/:id` - Delete status

## Real-time Features

The application uses Socket.io for real-time communication:

- **Message Events**: Send and receive messages instantly
- **Typing Indicators**: See when someone is typing
- **Online Status**: Track user availability
- **Notifications**: Real-time push notifications
- **Call Events**: Video call initiation and management

## Database Schema

### User Model
- Username, email, phone number
- Password hash, OTP
- Avatar, user profile data
- Timestamps

### Conversation Model
- Participants list
- Last message
- Timestamps

### Message Model
- Sender and receiver reference
- Message content and media
- Timestamps and read status

### Status Model
- User reference
- Content and media
- Expiry timestamp
- Viewers list

## Security Features

- JWT-based authentication
- Password hashing
- CORS configuration
- Environment variable protection
- OTP verification
- Secure cookie handling
- Input validation and sanitization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Environment Variables Reference

### Backend (.env)
```
PORT                          - Server port
MONGO_URI                     - MongoDB connection string
FRONTEND_URL                  - Frontend URL for CORS
JWT_SECRET                    - JWT signing secret
CLOUDINARY_NAME              - Cloudinary account name
CLOUDINARY_API_KEY           - Cloudinary API key
CLOUDINARY_API_SECRET        - Cloudinary API secret
TWILIO_ACCOUNT_SID           - Twilio account ID
TWILIO_AUTH_TOKEN            - Twilio authentication token
TWILIO_PHONE_NUMBER          - Twilio phone number
EMAIL_USER                   - Email address for sending
EMAIL_PASSWORD               - Email password/app token
```

### Frontend (.env)
```
VITE_API_URL                 - Backend API URL
VITE_SOCKET_URL              - Socket.io server URL
```