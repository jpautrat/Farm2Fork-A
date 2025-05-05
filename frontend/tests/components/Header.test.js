import { render, screen } from '@testing-library/react';
import Header from '@/components/layout/Header';
import { useUser } from '@supabase/auth-helpers-react';

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock the Supabase auth hooks
jest.mock('@supabase/auth-helpers-react', () => ({
  useUser: jest.fn(),
}));

describe('Header Component', () => {
  it('renders the logo and navigation links', () => {
    // Mock user as not logged in
    useUser.mockReturnValue(null);
    
    render(<Header />);
    
    // Check for logo
    expect(screen.getByText('Farm2Fork')).toBeInTheDocument();
    
    // Check for navigation links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Farmers')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    
    // Check for sign in button when not logged in
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
  
  it('renders user menu when logged in as consumer', () => {
    // Mock user as logged in consumer
    useUser.mockReturnValue({
      id: '123',
      email: 'consumer@example.com',
      user_metadata: {
        first_name: 'Test',
        last_name: 'Consumer',
        role: 'consumer',
      },
    });
    
    render(<Header />);
    
    // Check for user menu
    expect(screen.getByText('My Account')).toBeInTheDocument();
    
    // Should not show farmer or admin dashboard links
    expect(screen.queryByText('Farmer Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });
  
  it('renders farmer dashboard link when logged in as farmer', () => {
    // Mock user as logged in farmer
    useUser.mockReturnValue({
      id: '456',
      email: 'farmer@example.com',
      user_metadata: {
        first_name: 'Test',
        last_name: 'Farmer',
        role: 'farmer',
      },
    });
    
    render(<Header />);
    
    // Check for farmer dashboard link
    expect(screen.getByText('Farmer Dashboard')).toBeInTheDocument();
    
    // Should not show admin dashboard link
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });
  
  it('renders admin dashboard link when logged in as admin', () => {
    // Mock user as logged in admin
    useUser.mockReturnValue({
      id: '789',
      email: 'admin@example.com',
      user_metadata: {
        first_name: 'Test',
        last_name: 'Admin',
        role: 'admin',
      },
    });
    
    render(<Header />);
    
    // Check for admin dashboard link
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});
