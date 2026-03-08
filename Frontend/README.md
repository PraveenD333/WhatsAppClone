# WhatsApp Frontend

A modern, responsive real-time messaging UI built with React and Vite, featuring chat functionality, video calls, status updates, and user authentication.

## Features

- **User Authentication**: Secure login with OTP verification
- **Real-time Messaging**: Live chat with WebSocket support via Socket.io
- **Chat Management**: View conversations, search chats, and manage contacts
- **Message Bubbles**: Clean message display with timestamps
- **Status Updates**: Create and view stories similar to WhatsApp
- **Video Calls**: Integrated video calling interface
- **User Details**: Manage user profiles and settings
- **Theme Support**: Dark and light mode support
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Form Validation**: React Hook Form with Yup validation
- **Toast Notifications**: User-friendly notifications

## Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Yup
- **Routing**: React Router DOM
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Notifications**: React Toastify
- **Animation**: Framer Motion
- **Date Handling**: Date-fns
- **Emoji Picker**: Emoji Picker React

## Project Structure

```
Frontend/
├── src/
│   ├── Components/           # Reusable components
│   │   ├── HomePage.jsx      # Main home page
│   │   ├── Layout.jsx        # Main layout wrapper
│   │   ├── Sidebar.jsx       # Chat sidebar
│   │   └── UserDetails.jsx   # User profile details
│   │
│   ├── Pages/                # Page components
│   │   ├── Help.jsx          # Help page
│   │   ├── ChatSection/      # Chat-related pages
│   │   │   ├── ChatList.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   └── MessageBubble.jsx
│   │   ├── SettingSection/   # Settings pages
│   │   │   └── Setting.jsx
│   │   ├── StatusSection/    # Status/Stories pages
│   │   │   ├── Status.jsx
│   │   │   ├── StatusList.jsx
│   │   │   └── StatusPreview.jsx
│   │   ├── User-Login/       # Authentication pages
│   │   │   └── Login.jsx
│   │   └── VideoCall/        # Video call pages
│   │       ├── VideoCallManager.jsx
│   │       └── VideoCallModel.jsx
│   │
│   ├── Services/             # API services
│   │   ├── chat.service.js    # Chat API calls & socket events
│   │   ├── url.service.js     # Base URL configuration
│   │   └── user.service.js    # User API calls
│   │
│   ├── Store/                # Zustand state stores
│   │   ├── chatStore.js      # Chat state management
│   │   ├── layoutStore.js    # Layout state
│   │   ├── themeStore.js     # Theme/dark mode state
│   │   ├── useLoginStore.js  # Login state
│   │   ├── useStatusStore.js # Status state
│   │   ├── useUserStore.js   # User state
│   │   └── videoCallStore.js # Video call state
│   │
│   ├── Utils/                # Utility functions & components
│   │   ├── countriles.js     # Country data
│   │   ├── formateTime.js    # Time formatting utilities
│   │   ├── Loader.jsx        # Loading indicator
│   │   └── Spinner.jsx       # Loading spinner
│   │
│   ├── hooks/                # Custom React hooks
│   │   └── useOutsideClick.js # Detect clicks outside element
│   │
│   ├── images/               # Image assets
│   ├── assets/               # Other static assets
│   ├── App.jsx               # Main App component
│   ├── Protected.jsx         # Route protection logic
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles
│
├── public/                   # Static files
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
├── eslint.config.js          # ESLint configuration
├── package.json
└── README.md
```

## Key Components

### HomePage
Main dashboard displaying chat list and messages

### ChatWindow
Real-time chat interface with message sending and receiving

### Status
Stories-like feature for sharing updates

### VideoCallManager
Manages video call states and interactions

### Sidebar
Navigation and conversation list

## State Management (Zustand Stores)

- **chatStore** - Manages chat messages, conversations, and socket listeners
- **useUserStore** - Current user information and authentication
- **useLoginStore** - Login/logout state
- **useStatusStore** - Status updates and stories
- **videoCallStore** - Video call states
- **themeStore** - Dark/light mode preference
- **layoutStore** - Layout and UI state

## Services

### chat.service.js
- Initialize Socket.io connection
- Send/receive messages
- Real-time message handlers
- Conversation management

### user.service.js
- User registration and login
- User profile updates
- OTP verification

### url.service.js
- Base API URL configuration
- Axios instance setup

## Styling

- **Tailwind CSS** for utility-first styling
- **DaisyUI** for pre-built components (buttons, cards, etc.)
- **Custom CSS** in `index.css` for global styles
- **Responsive breakpoints** for mobile, tablet, and desktop