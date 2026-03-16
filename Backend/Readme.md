# WhatsApp Backend API

A real-time messaging backend application built with Node.js and Express, featuring chat functionality, video calls, status updates, and user authentication.

## Features

- **User Authentication**: Secure JWT-based authentication with OTP verification
- **Real-time Messaging**: WebSocket integration via Socket.io for instant messaging
- **Chat Management**: Create conversations, send and receive messages
- **Status Updates**: Share status updates similar to WhatsApp stories
- **Video Calls**: Video calling capabilities using Twilio
- **File Uploads**: Cloudinary integration for image and media uploads
- **Email & SMS**: Nodemailer for email notifications and Twilio for SMS
- **Database**: MongoDB with Mongoose

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Video**: Twilio
- **Email**: Nodemailer
- **File Upload**: Multer

## Project Structure

```
Backend/
├── Controllers/        # Request handlers
│   ├── auth.cont.js
│   ├── chat.cont.js
│   └── status.cont.js
├── Database/          # Database configuration
│   ├── cloudinaryConfig.js
│   └── connectdb.js
├── Middleware/        # Express middleware
│   └── auth.Middle.js
├── Models/            # MongoDB schemas
│   ├── user.model.js
│   ├── conversation.model.js
│   ├── message.model.js
│   └── status.model.js
├── Routes/            # API routes
│   ├── auth.route.js
│   ├── chat.route.js
│   └── status.route.js
├── Services/          # Business logic
│   ├── socket.serv.js
│   ├── emai.serv.js
│   ├── phone.serv.js
│   └── video.sev.js
├── Utils/             # Utility functions
│   ├── otpGenerater.js
│   ├── response.js
│   └── token.js
├── app.js             # Express app configuration
├── server.js          # Server entry point
└── package.json
```

## API Routes

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /verify-otp` - Verify OTP
- `POST /logout` - User logout

### Chat Routes (`/api/chats`)
- `GET /` - Get all conversations
- `POST /create` - Create a new conversation
- `GET /:id` - Get conversation details
- `POST /:id/message` - Send a message
- `GET /:id/messages` - Get conversation messages

### Status Routes (`/api/status`)
- `GET /` - Get all status updates
- `POST /create` - Create a new status
- `GET /:id` - Get status details
- `DELETE /:id` - Delete a status
