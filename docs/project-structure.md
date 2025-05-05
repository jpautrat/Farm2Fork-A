# Farm2Fork Project Structure

This document provides an overview of the Farm2Fork project structure, explaining the organization of files and directories.

## Root Directory

```
farm2fork/
├── frontend/           # Next.js frontend application
├── backend/            # Express.js backend API
├── docs/               # Project documentation
├── .gitignore          # Git ignore file
├── LICENSE             # MIT license
├── README.md           # Project overview
├── planning.md         # Project planning document
└── test_coverage.md    # Test coverage information
```

## Frontend Structure

```
frontend/
├── public/             # Static files
├── src/                # Source code
│   ├── app/            # Next.js app directory
│   │   ├── api/        # API route handlers
│   │   ├── auth/       # Authentication pages
│   │   │   ├── login/  # Login page
│   │   │   └── register/ # Registration page
│   │   ├── cart/       # Shopping cart page
│   │   ├── checkout/   # Checkout pages
│   │   ├── shop/       # Shop pages
│   │   ├── account/    # User account pages
│   │   ├── farmer/     # Farmer dashboard
│   │   ├── admin/      # Admin dashboard
│   │   ├── globals.css # Global styles
│   │   ├── layout.tsx  # Root layout component
│   │   ├── page.tsx    # Home page
│   │   └── providers.tsx # Context providers
│   ├── components/     # Reusable components
│   │   ├── layout/     # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── products/   # Product-related components
│   │   ├── cart/       # Cart-related components
│   │   ├── checkout/   # Checkout components
│   │   ├── forms/      # Form components
│   │   └── ui/         # UI components
│   ├── hooks/          # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useProducts.ts
│   ├── lib/            # Utility libraries
│   │   ├── api.ts      # API client
│   │   ├── supabase.ts # Supabase client
│   │   └── stripe.ts   # Stripe client
│   ├── store/          # State management
│   │   ├── cartStore.ts
│   │   └── authStore.ts
│   ├── types/          # TypeScript type definitions
│   │   ├── product.ts
│   │   ├── user.ts
│   │   └── order.ts
│   └── utils/          # Utility functions
│       ├── formatters.ts
│       └── validators.ts
├── .env.example        # Example environment variables
├── .eslintrc.json      # ESLint configuration
├── jest.config.js      # Jest configuration
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies and scripts
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Backend Structure

```
backend/
├── src/                # Source code
│   ├── config/         # Configuration files
│   │   ├── supabase.js # Supabase client
│   │   ├── schema.sql  # Database schema
│   │   └── seed.js     # Database seed data
│   ├── controllers/    # Request handlers
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── payment.controller.js
│   │   ├── shipping.controller.js
│   │   └── user.controller.js
│   ├── middleware/     # Express middleware
│   │   ├── auth.js     # Authentication middleware
│   │   ├── errorHandler.js # Error handling middleware
│   │   └── validateRequest.js # Request validation
│   ├── models/         # Data models
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   └── order.model.js
│   ├── routes/         # API routes
│   │   ├── index.js    # Route index
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── payment.routes.js
│   │   ├── shipping.routes.js
│   │   └── user.routes.js
│   ├── services/       # Business logic
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   ├── order.service.js
│   │   ├── payment.service.js
│   │   └── shipping.service.js
│   ├── utils/          # Utility functions
│   │   ├── logger.js   # Logging utility
│   │   └── helpers.js  # Helper functions
│   └── index.js        # Application entry point
├── .env.example        # Example environment variables
├── .eslintrc.json      # ESLint configuration
├── jest.config.js      # Jest configuration
└── package.json        # Dependencies and scripts
```

## Documentation Structure

```
docs/
├── api-reference.md    # API documentation
├── architecture-diagram.md # System architecture
└── project-structure.md # This file
```

## Key Files and Their Purpose

### Frontend

- **src/app/layout.tsx**: Root layout component that wraps all pages
- **src/app/page.tsx**: Home page component
- **src/app/providers.tsx**: Context providers for authentication, cart, etc.
- **src/components/layout/Header.tsx**: Navigation header component
- **src/components/layout/Footer.tsx**: Footer component
- **src/components/products/ProductCard.tsx**: Product card component
- **src/store/cartStore.ts**: Shopping cart state management
- **src/app/shop/page.tsx**: Shop page with product listings
- **src/app/cart/page.tsx**: Shopping cart page
- **src/app/checkout/page.tsx**: Checkout page
- **src/app/auth/login/page.tsx**: Login page
- **src/app/auth/register/page.tsx**: Registration page

### Backend

- **src/index.js**: Main entry point for the Express application
- **src/routes/index.js**: API route definitions
- **src/controllers/auth.controller.js**: Authentication logic
- **src/controllers/product.controller.js**: Product management logic
- **src/controllers/order.controller.js**: Order processing logic
- **src/middleware/auth.js**: JWT authentication middleware
- **src/config/schema.sql**: Database schema definition
- **src/config/seed.js**: Initial data seeding script

## Database Schema

The database schema is defined in `backend/src/config/schema.sql` and includes the following tables:

- **users**: User accounts with role-based access
- **farmer_profiles**: Profiles for farmer users
- **consumer_profiles**: Profiles for consumer users
- **addresses**: User shipping addresses
- **categories**: Product categories
- **products**: Product listings
- **orders**: Customer orders
- **order_items**: Items within orders
- **payments**: Payment records
- **reviews**: Product reviews

## API Structure

The API follows RESTful principles and is organized by resource:

- **/api/auth**: Authentication endpoints
- **/api/products**: Product management
- **/api/orders**: Order processing
- **/api/payments**: Payment processing
- **/api/shipping**: Shipping calculations
- **/api/users**: User management

For detailed API documentation, see the [API Reference](api-reference.md) document.
