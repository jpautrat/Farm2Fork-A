# Farm2Fork

![Farm2Fork Logo](https://via.placeholder.com/200x100?text=Farm2Fork+Logo)

Farm2Fork is a production-grade full-stack e-commerce platform that connects local farmers directly with consumers, enabling the purchase and delivery of fresh, locally-sourced food products. The platform aims to support local agriculture, promote sustainable food systems, and provide consumers with access to high-quality, locally-grown produce.

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-netlify-badge-id/deploy-status)](https://app.netlify.com/sites/farm2fork/deploys)
[![GitHub license](https://img.shields.io/github/license/jpautrat/Farm2Fork-A)](https://github.com/jpautrat/Farm2Fork-A/blob/main/LICENSE)

## Project Overview

Farm2Fork is a comprehensive platform with three main components:

1. **Farmer Dashboard** - A secure portal for farmers to manage products, track orders, and view analytics
2. **Consumer Portal** - A user-friendly interface for consumers to browse, purchase, and track deliveries
3. **Admin Panel** - A powerful management tool for platform administrators

The project is built with modern web technologies, follows best practices for security and performance, and provides a seamless experience across devices.

## Features

### For Farmers
- Secure registration and login
- Role-based access control
- Product management (add, edit, delete listings)
- Order management and fulfillment tracking
- Analytics dashboard with sales metrics
- Profile management with image upload

### For Consumers
- Account creation and secure login
- Browse, search, and filter product listings
- Shopping cart functionality with Zustand state management
- Checkout flow with Stripe integration
- Real-time shipping calculations via EasyPost
- Order history and tracking

### For Administrators
- Comprehensive admin dashboard
- User management (view, edit, delete users)
- Product moderation and management
- Order monitoring and management
- System logs and monitoring
- Analytics dashboard with platform metrics

## Tech Stack

### Frontend
- **Framework**: Next.js 13+ with App Router and TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Zustand for client-side state (cart, notifications)
- **Data Fetching**: React Query with retry mechanisms
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Supabase Auth with JWT
- **Internationalization**: Support for English and Spanish
- **PWA Features**: Service worker, offline support, install prompts
- **Deployment**: Netlify (static export)

### Backend
- **Framework**: Express.js (Node.js) with TypeScript
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT via Supabase Auth
- **Payment Processing**: Stripe with webhook integration
- **Shipping**: EasyPost for real-time shipping calculations
- **Caching**: Two-level caching (in-memory and Redis)
- **Rate Limiting**: Tiered system with Redis support
- **Real-time**: Socket.IO for notifications
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Render

### Architecture Diagram

![Farm2Fork Architecture](https://via.placeholder.com/800x400?text=Farm2Fork+Architecture+Diagram)

The architecture follows a modern, scalable design with clear separation of concerns and robust integration points.

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Supabase account
- Stripe account
- EasyPost account

### Installation

1. Clone the repository
```bash
git clone https://github.com/jpautrat/Farm2Fork-A.git
cd Farm2Fork-A
```

2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables
```bash
# Copy the example env files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

4. Set up Supabase
   - Create a new Supabase project
   - Run the database schema from `backend/src/config/schema.sql`
   - Create a storage bucket named `farm2fork` with public folders: `farmers`, `consumers`, and `public`
   - Update your environment variables with the Supabase URL and keys

5. Start the development servers
```bash
# Start the frontend
cd frontend
npm run dev

# Start the backend
cd ../backend
npm run dev
```

### Testing

Run the tests for the backend:
```bash
cd backend
npm test
```

Run the tests for the frontend:
```bash
cd frontend
npm test
```

### Deployment

The project is configured for deployment with:
- Frontend: Netlify
- Backend: Render
- Database: Supabase

CI/CD is set up using GitHub Actions. When you push to the main branch, it will:
1. Run tests for both frontend and backend
2. If tests pass, deploy the frontend to Netlify and the backend to Render

## Technical Highlights

### Rate Limiting System

The backend implements a sophisticated rate limiting system:

- **IP-Based Rate Limiting**:
  - Default: 100 requests/minute for most endpoints
  - Strict: 20 requests/minute for sensitive endpoints (auth)
  - Relaxed: 300 requests/minute for public endpoints (product listings)
- **API Key-Based Rate Limiting**:
  - Basic Tier: 100 requests/minute
  - Premium Tier: 300 requests/minute
  - Enterprise Tier: 1000 requests/minute
- **Distributed Rate Limiting**:
  - Redis-based for scalability
  - Fallback to memory store if Redis is unavailable

### Caching System

The project implements a robust caching strategy:

- **Server-side Caching**:
  - In-memory cache for frequently accessed data
  - Redis support for distributed environments
  - Automatic cache invalidation
  - TTL (Time To Live) for cache entries
- **HTTP Caching**:
  - Cache headers for static assets
  - Different policies for authenticated vs. unauthenticated routes

### Error Handling and Offline Support

The application includes comprehensive error handling:

- **API Client with Retry Logic**:
  - Automatic retry for failed requests
  - Exponential backoff
  - Offline detection
- **Error Boundaries**:
  - Global error boundary
  - Section-specific error boundaries
  - Custom fallback UIs
- **Offline Detection**:
  - Network status monitoring
  - Offline notification banner
  - Recovery notification

## Project Structure

The project follows a clean, modular structure to ensure maintainability and scalability. For a detailed overview of the project structure, see the [Project Structure](docs/project-structure.md) document.

### Frontend Structure

```
frontend/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Authentication routes
│   ├── (dashboard)/      # Farmer dashboard routes
│   ├── (main)/           # Main consumer routes
│   └── admin/            # Admin panel routes
├── components/           # Reusable UI components
│   ├── common/           # Shared components
│   ├── dashboard/        # Farmer dashboard components
│   ├── admin/            # Admin panel components
│   └── shop/             # Consumer shop components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and services
├── store/                # Zustand state management
├── styles/               # Global styles and Tailwind config
└── public/               # Static assets and PWA files
```

### Backend Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── config/           # Configuration files
├── tests/                # Test files
└── docs/                 # API documentation
```

## Database Schema

The PostgreSQL database includes tables for:

- Users (with role differentiation)
- Farmer profiles
- Consumer profiles
- Products
- Categories
- Orders
- Order items
- Payments
- Addresses
- Reviews

### Database Entity Relationship Diagram

![Farm2Fork Database Schema](https://via.placeholder.com/800x600?text=Database+Entity+Relationship+Diagram)
*Entity Relationship Diagram showing the relationships between database tables*

## Screenshots

![Farm2Fork Consumer Portal](https://via.placeholder.com/800x500?text=Consumer+Portal+-+Product+Browsing)
*Consumer Portal - Product Browsing*

![Farm2Fork Farmer Dashboard](https://via.placeholder.com/800x500?text=Farmer+Dashboard+-+Order+Management)
*Farmer Dashboard - Order Management*

![Farm2Fork Admin Panel](https://via.placeholder.com/800x500?text=Admin+Panel+-+Analytics+Dashboard)
*Admin Panel - Analytics Dashboard*

## Contributing

Contributions to Farm2Fork are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Express.js](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
- [Supabase](https://supabase.io/) - The open source Firebase alternative
- [Stripe](https://stripe.com/) - Online payment processing for internet businesses
- [EasyPost](https://www.easypost.com/) - Shipping API for e-commerce
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - Bear necessities for state management in React
- [React Query](https://react-query.tanstack.com/) - Hooks for fetching, caching and updating data

## API Reference

Detailed API documentation can be found in the [API Reference](docs/api-reference.md) document.

## Architecture

The Farm2Fork platform follows a modern, scalable architecture designed to provide a seamless experience for farmers and consumers.

### System Architecture Diagram

![Farm2Fork System Architecture](https://via.placeholder.com/800x500?text=System+Architecture+Diagram)
*Detailed system architecture showing frontend, backend, database, and third-party integrations*

For a detailed architecture explanation, see the [Architecture Diagram](docs/architecture-diagram.md) document.

## User Guides

Comprehensive user guides are available for all platform users:

- [Farmer Guide](docs/user-guides/farmer-guide.md) - Complete guide for farmers using the platform
- [Consumer Guide](docs/user-guides/consumer-guide.md) - Guide for consumers shopping on Farm2Fork
- [Administrator Guide](docs/user-guides/admin-guide.md) - Detailed guide for platform administrators

### User Workflow Diagram

![Farm2Fork User Workflow](https://via.placeholder.com/800x400?text=User+Workflow+Diagram)
*Diagram illustrating the typical user journey for farmers and consumers on the platform*

## Error Handling and Offline Support

Farm2Fork includes robust error handling and offline capabilities:

- Automatic retry for failed API requests with exponential backoff
- Comprehensive error boundaries to prevent UI crashes
- Offline detection with recovery notifications
- Graceful degradation when certain features are unavailable

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
