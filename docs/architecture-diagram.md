# Farm2Fork Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           CLIENT LAYER                                  │
│                                                                         │
│  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐         │
│  │               │     │               │     │               │         │
│  │  Web Browser  │     │  Mobile App   │     │  Admin Panel  │         │
│  │               │     │               │     │               │         │
│  └───────┬───────┘     └───────┬───────┘     └───────┬───────┘         │
│          │                     │                     │                 │
└──────────┼─────────────────────┼─────────────────────┼─────────────────┘
           │                     │                     │
           │                     │                     │
           │                     │                     │
┌──────────┼─────────────────────┼─────────────────────┼─────────────────┐
│          │                     │                     │                 │
│          ▼                     ▼                     ▼                 │
│  ┌───────────────────────────────────────────────────────────┐         │
│  │                                                           │         │
│  │                     FRONTEND LAYER                        │         │
│  │                                                           │         │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │         │
│  │  │             │   │             │   │             │     │         │
│  │  │  Next.js    │   │  React      │   │  Tailwind   │     │         │
│  │  │  Framework  │   │  Components │   │  CSS        │     │         │
│  │  │             │   │             │   │             │     │         │
│  │  └─────────────┘   └─────────────┘   └─────────────┘     │         │
│  │                                                           │         │
│  └───────────────────────────────┬───────────────────────────┘         │
│                                  │                                     │
│                                  │                                     │
│                                  ▼                                     │
│  ┌───────────────────────────────────────────────────────────┐         │
│  │                                                           │         │
│  │                      API GATEWAY                          │         │
│  │                                                           │         │
│  └───────────────────────────────┬───────────────────────────┘         │
│                                  │                                     │
│                                  │                                     │
│                                  ▼                                     │
│  ┌───────────────────────────────────────────────────────────┐         │
│  │                                                           │         │
│  │                     BACKEND LAYER                         │         │
│  │                                                           │         │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │         │
│  │  │             │   │             │   │             │     │         │
│  │  │  Express.js │   │  Node.js    │   │  JWT Auth   │     │         │
│  │  │  API        │   │  Runtime    │   │  Middleware │     │         │
│  │  │             │   │             │   │             │     │         │
│  │  └─────────────┘   └─────────────┘   └─────────────┘     │         │
│  │                                                           │         │
│  └───┬───────────────────┬───────────────────┬───────────────┘         │
│      │                   │                   │                         │
│      │                   │                   │                         │
│      ▼                   ▼                   ▼                         │
│  ┌─────────┐       ┌─────────┐       ┌─────────────┐                  │
│  │         │       │         │       │             │                  │
│  │ Supabase│       │ Stripe  │       │ EasyPost    │                  │
│  │ Auth    │       │ Payments│       │ Shipping    │                  │
│  │         │       │         │       │             │                  │
│  └────┬────┘       └────┬────┘       └──────┬──────┘                  │
│       │                 │                   │                         │
│       │                 │                   │                         │
└───────┼─────────────────┼───────────────────┼─────────────────────────┘
        │                 │                   │
        │                 │                   │
┌───────┼─────────────────┼───────────────────┼─────────────────────────┐
│       │                 │                   │                         │
│       ▼                 ▼                   ▼                         │
│  ┌─────────┐       ┌─────────┐       ┌─────────────┐                  │
│  │         │       │         │       │             │                  │
│  │ Supabase│       │ Stripe  │       │ EasyPost    │                  │
│  │ Service │       │ Service │       │ Service     │                  │
│  │         │       │         │       │             │                  │
│  └────┬────┘       └─────────┘       └─────────────┘                  │
│       │                                                               │
│       ▼                                                               │
│  ┌─────────┐                                                          │
│  │         │                                                          │
│  │PostgreSQL│                                                         │
│  │Database  │                                                         │
│  │         │                                                          │
│  └─────────┘                                                          │
│                                                                       │
│                      INFRASTRUCTURE LAYER                             │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Architecture Overview

The Farm2Fork platform follows a modern, scalable architecture designed to provide a seamless experience for farmers and consumers. The architecture is divided into several layers:

### Client Layer

- **Web Browser**: The primary interface for users to access the platform
- **Mobile App**: Future mobile application for iOS and Android
- **Admin Panel**: Interface for administrators to manage the platform

### Frontend Layer

- **Next.js Framework**: Server-side rendering for improved SEO and performance
- **React Components**: Reusable UI components for consistent user experience
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### API Gateway

Acts as a single entry point for all client requests, handling routing, authentication, and rate limiting.

### Backend Layer

- **Express.js API**: RESTful API endpoints for all platform functionality
- **Node.js Runtime**: JavaScript runtime for server-side logic
- **JWT Auth Middleware**: Secure authentication using JSON Web Tokens

### Service Integrations

- **Supabase Auth**: User authentication and authorization
- **Stripe Payments**: Secure payment processing
- **EasyPost Shipping**: Shipping rate calculation and label generation

### Infrastructure Layer

- **Supabase Service**: Backend-as-a-Service for database and authentication
- **PostgreSQL Database**: Relational database for storing all application data
- **Stripe Service**: Payment processing infrastructure
- **EasyPost Service**: Shipping API infrastructure

## Data Flow

1. Users interact with the platform through the client layer (web browser, mobile app)
2. The frontend layer renders the UI and handles client-side logic
3. API requests are sent to the API gateway
4. The backend layer processes requests, applies business logic, and interacts with services
5. Data is stored in and retrieved from the PostgreSQL database
6. External services (Stripe, EasyPost) are used for specialized functionality

## Deployment Architecture

- **Frontend**: Deployed on Netlify via GitHub integration
- **Backend**: Deployed on Render
- **Database**: Hosted on Supabase
- **CI/CD**: Automated deployment via GitHub Actions

## Security Considerations

- JWT-based authentication
- HTTPS for all communications
- Role-based access control
- Input validation and sanitization
- Regular security audits
- Data encryption at rest and in transit
