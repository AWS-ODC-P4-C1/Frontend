// src/pages/__tests__/Home.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Home from '../Home';

// Mock the AuthContext
const mockAuthContext = (user = null) => ({
  currentUser: user,
});

// Helper to render the component within the necessary providers
const renderHomeComponent = (currentUser = null) => {
  return render(
    <AuthContext.Provider value={mockAuthContext(currentUser)}>
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Home Component', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.resetAllMocks();
  });

  it('renders the app title correctly', () => {
    renderHomeComponent();
    expect(screen.getByText('Welcome to')).toBeInTheDocument();
    expect(screen.getByText('ProfileApp')).toBeInTheDocument();
  });

  it('renders login and register buttons when user is not authenticated', () => {
    renderHomeComponent();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders personalized greeting when user is authenticated with first name', () => {
    const mockUser = {
      first_name: 'John',
      email: 'john@example.com'
    };
    
    renderHomeComponent(mockUser);
    
    expect(screen.getByText(/Hello, John!/)).toBeInTheDocument();
    expect(screen.getByText('View Your Profile')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });

  it('renders email-based greeting when user has no first name', () => {
    const mockUser = {
      first_name: null,
      email: 'john@example.com'
    };
    
    renderHomeComponent(mockUser);
    
    expect(screen.getByText(/Hello, john!/)).toBeInTheDocument();
  });

  it('renders the initial letter of user name in avatar', () => {
    const mockUser = {
      first_name: 'John',
      email: 'john@example.com'
    };
    
    renderHomeComponent(mockUser);
    
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders the initial letter of email in avatar when no first name', () => {
    const mockUser = {
      first_name: null,
      email: 'john@example.com'
    };
    
    renderHomeComponent(mockUser);
    
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders the features section', () => {
    renderHomeComponent();
    expect(screen.getByText('Why Choose ProfileApp')).toBeInTheDocument();
    expect(screen.getByText('Secure & Private')).toBeInTheDocument();
    expect(screen.getByText('Fast & Responsive')).toBeInTheDocument();
    expect(screen.getByText('Beautiful UI')).toBeInTheDocument();
  });

  it('renders the footer with current year', () => {
    // Mock the Date constructor to return a fixed date
    const mockDate = new Date('2025-04-26');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    renderHomeComponent();
    
    expect(screen.getByText(/© 2025 ProfileApp\. All rights reserved\./)).toBeInTheDocument();
    
    // Restore the original Date implementation
    vi.restoreAllMocks();
  });
});