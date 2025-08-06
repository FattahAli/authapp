# Auth App - Full Stack User Management

A modern, full-stack user management application with OAuth authentication, real-time analytics, and profile management.

## Features

- 🔐 **OAuth Authentication**: Google and Facebook login support
- 👤 **User Management**: Complete user profile management
- 📊 **Real-time Analytics**: Interactive charts and graphs
- 🎨 **Modern UI**: Beautiful, responsive design with dark theme
- 🔒 **Secure**: JWT-based authentication with HttpOnly cookies
- 📱 **Responsive**: Works on desktop and mobile devices

## Tech Stack

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** ORM with PostgreSQL
- **JWT** for authentication
- **Cloudinary** for image uploads
- **OAuth** integration for Google and Facebook

### Frontend

- **Next.js 14** with App Router
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Chart.js** for analytics
- **Zustand** for state management
- **React Hook Form** for form handling

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account (for image uploads)

### 1. Clone the repository

```bash
git clone <repository-url>
cd auth-app
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend (.env in backend directory)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/auth_app"
DIRECT_URL="postgresql://username:password@localhost:5432/auth_app"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend (.env.local in frontend directory)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# OAuth Configuration (for production)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
NEXT_PUBLIC_FACEBOOK_APP_ID="your-facebook-app-id"
```

### 4. Database Setup

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. Start the application

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory, in a new terminal)
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
6. Copy the Client ID to your frontend environment variables

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth settings
5. Add authorized redirect URIs
6. Copy the App ID to your frontend environment variables

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/oauth/login` - OAuth login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile

## Features Overview

### Authentication

- Email/password registration and login
- OAuth login with Google and Facebook
- JWT-based session management
- Secure password hashing with bcrypt

### User Management

- Complete user profiles with age, gender, and profile pictures
- Profile editing capabilities
- User listing with pagination
- Individual user detail pages

### Analytics Dashboard

- Real-time user statistics
- Interactive charts and graphs
- Gender and age distribution
- Authentication method breakdown
- Monthly user growth trends
- Recent activity feed

### UI/UX

- Modern dark theme design
- Responsive layout for all devices
- Smooth animations and transitions
- Toast notifications for user feedback
- Loading states and error handling

## Development

### Backend Development

```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run db:studio    # Open Prisma Studio
npm run db:push      # Push schema changes
```

### Frontend Development

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## Database Schema

The application uses Prisma with the following main models:

```prisma
model User {
  id             String         @id @default(cuid())
  email          String         @unique
  password       String?        // Optional for OAuth users
  name           String
  age            Int?
  gender         Gender?
  profilePicture String?
  oauthProvider  OAuthProvider?
  oauthId        String?        @unique
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue on GitHub.
