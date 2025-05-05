# Farm2Fork

Farm2Fork is a full-stack e-commerce platform that connects local farmers directly with consumers, enabling the purchase and delivery of fresh, locally-sourced food products.

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

- **Frontend**: Next.js (React)
- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT (via Supabase Auth)
- **Payment Processing**: Stripe
- **Shipping**: EasyPost
- **Deployment**: Netlify (frontend), Render (backend)

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
git clone https://github.com/yourusername/farm2fork.git
cd farm2fork
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

## Project Structure

The project follows a clean, modular structure to ensure maintainability and scalability. For a detailed overview of the project structure, see the [Project Structure](docs/project-structure.md) document.

## API Reference

Detailed API documentation can be found in the [API Reference](docs/api-reference.md) document.

## Architecture

The Farm2Fork platform follows a modern, scalable architecture designed to provide a seamless experience for farmers and consumers.

For a detailed architecture diagram and explanation, see the [Architecture Diagram](docs/architecture-diagram.md) document.

## User Guides

Comprehensive user guides are available for all platform users:

- [Farmer Guide](docs/user-guides/farmer-guide.md) - Complete guide for farmers using the platform
- [Consumer Guide](docs/user-guides/consumer-guide.md) - Guide for consumers shopping on Farm2Fork
- [Administrator Guide](docs/user-guides/admin-guide.md) - Detailed guide for platform administrators

## Error Handling and Offline Support

Farm2Fork includes robust error handling and offline capabilities:

- Automatic retry for failed API requests with exponential backoff
- Comprehensive error boundaries to prevent UI crashes
- Offline detection with recovery notifications
- Graceful degradation when certain features are unavailable

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
