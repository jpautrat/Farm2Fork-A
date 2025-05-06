# Farm2Fork Project Prompts

This document contains examples of prompts used to build the Farm2Fork project, showcasing the collaboration between human and AI to create a full-stack e-commerce platform connecting farmers to consumers.

**Note: Please convert this markdown file to PDF format and save it as _prompts.pdf for the final submission.**

## Initial Project Planning Prompts

### Project Requirements Gathering

```
I need to build a full-stack e-commerce platform called Farm2Fork that connects local farmers directly with consumers for food delivery. The platform should include:

1. A farmer dashboard for managing products and orders
2. A consumer portal for browsing and purchasing products
3. An admin panel for platform management

Can you help me define detailed functional and non-functional requirements for this project?
```

### User Persona Development

```
For the Farm2Fork project, I need to create user personas to better understand the needs of our target users. Can you help me develop detailed personas for:

1. A typical farmer who would sell products on the platform
2. A typical consumer who would purchase products
3. An administrator who would manage the platform

Include demographics, goals, pain points, and technical proficiency for each persona.
```

### System Architecture Design

```
Based on the requirements and user personas for Farm2Fork, can you propose a comprehensive system architecture? I need:

1. Frontend architecture (framework, state management, UI components)
2. Backend architecture (API design, database schema, authentication)
3. Integration points with third-party services (payment, shipping)
4. Deployment strategy

The solution should be scalable, secure, and maintainable.
```

## Frontend Development Prompts

### Next.js Setup

```
I'm starting the frontend development for Farm2Fork using Next.js. Can you help me set up the project with:

1. TypeScript configuration
2. Tailwind CSS integration
3. Folder structure following best practices
4. Essential dependencies for an e-commerce platform

Please provide the necessary commands and configuration files.
```

### Product Catalog Implementation

```
For the Farm2Fork frontend, I need to implement the product catalog page. The requirements are:

1. Grid display of products with images, names, prices, and farm information
2. Filtering by category, price range, and farm location
3. Search functionality
4. Pagination for large result sets
5. Skeleton loaders during data fetching

Can you provide the React components and hooks needed for this implementation?
```

### Shopping Cart with Zustand

```
I need to implement a shopping cart for Farm2Fork using Zustand for state management. The cart should:

1. Allow adding/removing products
2. Update quantities
3. Calculate totals
4. Persist between sessions
5. Sync with the backend when the user is logged in

Please provide the Zustand store implementation and the necessary React components.
```

## Backend Development Prompts

### Express.js API Setup

```
I'm setting up the backend for Farm2Fork using Express.js. Can you help me with:

1. Project structure following best practices
2. Middleware configuration (CORS, body parsing, error handling)
3. Route organization
4. Database connection setup with PostgreSQL
5. Authentication middleware using JWT

Please provide the necessary code and configuration files.
```

### Rate Limiting Implementation

```
For the Farm2Fork backend, I need to implement a sophisticated rate limiting system with:

1. IP-based rate limiting with different tiers (strict for auth, relaxed for public endpoints)
2. API key-based rate limiting with different tiers based on subscription
3. Redis-based distributed rate limiting with fallback to memory store
4. Proper response headers and error messages

Can you provide the implementation for this system?
```

### Payment Integration with Stripe

```
I need to integrate Stripe payment processing into the Farm2Fork backend. The requirements are:

1. Create payment intents for orders
2. Handle webhook events for payment status updates
3. Implement proper error handling and security measures
4. Store payment records in the database

Please provide the necessary routes, controllers, and services for this integration.
```

## Database and Authentication Prompts

### PostgreSQL Schema Design

```
For the Farm2Fork project, I need to design a comprehensive PostgreSQL database schema. The schema should include:

1. Users table with role differentiation (farmer, consumer, admin)
2. Products and categories tables
3. Orders and order items tables
4. Payments and shipping details tables
5. Proper relations, constraints, and indexes

Please provide the SQL schema definition with appropriate data types and relationships.
```

### Supabase Authentication Setup

```
I'm using Supabase for authentication in the Farm2Fork project. Can you help me with:

1. Setting up Supabase Auth with JWT
2. Implementing role-based access control
3. Creating the necessary frontend components for registration and login
4. Securing API routes based on user roles
5. Handling token refresh and session management

Please provide the necessary code and configuration for both frontend and backend.
```

## Deployment and Testing Prompts

### Netlify Deployment Configuration

```
I need to deploy the Farm2Fork frontend to Netlify. Can you help me with:

1. Creating a netlify.toml configuration file
2. Setting up redirects for the SPA
3. Configuring environment variables
4. Setting up continuous deployment from GitHub
5. Optimizing build settings for performance

Please provide the necessary configuration files and deployment steps.
```

### End-to-End Testing Setup

```
For the Farm2Fork project, I need to set up end-to-end testing using Playwright. The tests should cover:

1. User registration and login flows
2. Product browsing and filtering
3. Shopping cart operations
4. Checkout process
5. Farmer dashboard operations
6. Admin panel functionality

Please provide the test configuration and example test cases for critical user flows.
```

## Accessibility and Internationalization Prompts

### WCAG Compliance Implementation

```
I need to ensure the Farm2Fork frontend meets WCAG 2.1 AA compliance standards. Can you help me with:

1. Implementing proper semantic HTML
2. Adding ARIA attributes where necessary
3. Ensuring sufficient color contrast
4. Implementing keyboard navigation
5. Creating skip links for screen readers

Please provide examples of how to make key components accessible.
```

### Multi-language Support

```
I want to add internationalization to the Farm2Fork platform with support for English and Spanish. Can you help me with:

1. Setting up the i18n infrastructure
2. Creating translation files
3. Implementing a language switcher component
4. Handling date, time, and currency formatting
5. Ensuring RTL support for future language additions

Please provide the necessary code and configuration files.
```

These prompts represent a sample of the collaboration between human and AI throughout the development of the Farm2Fork project. Each prompt led to detailed responses that guided the implementation of various features and components of the platform.
