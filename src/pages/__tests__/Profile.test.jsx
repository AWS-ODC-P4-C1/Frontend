import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../Profile';
import { describe, it, expect } from 'vitest';
import { AuthContext } from '../../context/AuthContext';

describe('Profile', () => {
  it('renders loading state when user is not available', () => {
    render(
      <AuthContext.Provider value={{ currentUser: null }}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Loading your profile...')).toBeInTheDocument();
  });

  it('renders user profile when user is available', () => {
    const mockUser = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com'
    };

    render(
      <AuthContext.Provider value={{ currentUser: mockUser }}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Use more specific selectors to avoid multiple matches
    const firstNameElement = screen.getByText('First Name').nextElementSibling;
    expect(firstNameElement).toHaveTextContent('John');
    
    const lastNameElement = screen.getByText('Last Name').nextElementSibling;
    expect(lastNameElement).toHaveTextContent('Doe');
    
    const emailElement = screen.getByText('Email Address').nextElementSibling;
    expect(emailElement).toHaveTextContent('john@example.com');
    
    // Check for links
    expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
    expect(screen.getByText('Edit Your Profile')).toBeInTheDocument();
  });

  it('renders user with missing profile information', () => {
    const mockUser = {
      email: 'jane@example.com',
      // No first_name or last_name
    };

    render(
      <AuthContext.Provider value={{ currentUser: mockUser }}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    const firstNameElement = screen.getByText('First Name').nextElementSibling;
    expect(firstNameElement).toHaveTextContent('Not provided');
    
    const lastNameElement = screen.getByText('Last Name').nextElementSibling;
    expect(lastNameElement).toHaveTextContent('Not provided');
    
    // Check for email
    const emailElement = screen.getByText('Email Address').nextElementSibling;
    expect(emailElement).toHaveTextContent('jane@example.com');
    
    // Check for profile title
    expect(screen.getByText('Your Profile')).toBeInTheDocument();
  });

  it('renders location when available', () => {
    const mockUser = {
      first_name: 'John',
      email: 'john@example.com',
      location: 'New York'
    };

    render(
      <AuthContext.Provider value={{ currentUser: mockUser }}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Check for location
    expect(screen.getByText('Location')).toBeInTheDocument();
    const locationElement = screen.getByText('Location').nextElementSibling;
    expect(locationElement).toHaveTextContent('New York');
  });

  it('does not render location when not available', () => {
    const mockUser = {
      first_name: 'John',
      email: 'john@example.com',
      // No location
    };

    render(
      <AuthContext.Provider value={{ currentUser: mockUser }}>
        <BrowserRouter>
          <Profile />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Location should not be present
    expect(screen.queryByText('Location')).not.toBeInTheDocument();
  });
});