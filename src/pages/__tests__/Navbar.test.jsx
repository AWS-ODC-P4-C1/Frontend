// src/components/__tests__/Navbar.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

// Mock react-router-dom's useLocation hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn()
  };
});

// Import the mocked useLocation to control its return value
import { useLocation } from 'react-router-dom';

// Helper to render the Navbar component with necessary providers
const renderNavbar = (currentUser = null, pathname = '/', logoutFn = vi.fn()) => {
  // Setup useLocation mock to return the desired pathname
  useLocation.mockReturnValue({ pathname });
  
  return render(
    <AuthContext.Provider value={{
      currentUser: currentUser,
      logout: logoutFn
    }}>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the app logo and title', () => {
    renderNavbar();
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('ProfileApp')).toBeInTheDocument();
  });

  describe('When user is not authenticated', () => {
    it('displays login and register links', () => {
      renderNavbar();
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('does not display profile link or logout button', () => {
      renderNavbar();
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('applies active class to correct link based on current location', () => {
      renderNavbar(null, '/login');
      
      // The Login link should have the active class (bg-indigo-800)
      const loginLink = screen.getByText('Login');
      expect(loginLink.className).toContain('bg-indigo-800');
      
      // The Home link should not have the active class
      const homeLink = screen.getByText('Home');
      expect(homeLink.className).not.toContain('bg-indigo-800');
    });
  });

  describe('When user is authenticated', () => {
    const mockUser = {
      first_name: 'Jane',
      email: 'jane@example.com'
    };

    it('displays profile link and logout button', () => {
      renderNavbar(mockUser);
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('does not display login and register links', () => {
      renderNavbar(mockUser);
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
      expect(screen.queryByText('Register')).not.toBeInTheDocument();
    });

    it('displays user avatar with correct initial', () => {
      renderNavbar(mockUser);
      expect(screen.getAllByText('J').length).toBeGreaterThan(0); // J for Jane
    });

    it('calls logout function when logout button is clicked', () => {
      const logoutMock = vi.fn();
      renderNavbar(mockUser, '/', logoutMock);
      
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
      
      // Check if logout function was called
      expect(logoutMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Avatar initial display', () => {
    it('shows first letter of first_name when available', () => {
      const user = { first_name: 'Alex', email: 'alex@example.com' };
      renderNavbar(user);
      expect(screen.getAllByText('A').length).toBeGreaterThan(0);
    });

    it('shows first letter of email when first_name is not available', () => {
      const user = { first_name: null, email: 'bob@example.com' };
      renderNavbar(user);
      expect(screen.getAllByText('B').length).toBeGreaterThan(0);
    });

    it('shows "U" when neither first_name nor email is available', () => {
      const user = { first_name: null, email: null };
      renderNavbar(user);
      expect(screen.getAllByText('U').length).toBeGreaterThan(0);
    });
  });

  describe('Mobile menu functionality', () => {
    it('does not show mobile menu by default', () => {
      renderNavbar();
      // The mobile menu items should not be visible initially
      // We can check if the container for mobile navigation is not in the document
      expect(screen.queryByText('Home').parentElement.parentElement.className).not.toContain('pb-3 pt-2');
    });

    it('toggles mobile menu when hamburger icon is clicked', () => {
      renderNavbar();
      
      // Find and click the hamburger button
      const hamburgerButton = document.querySelector('button svg');
      fireEvent.click(hamburgerButton.parentElement);
      
      // Now the mobile menu should be visible
      expect(document.querySelector('.pb-3.pt-2')).toBeInTheDocument();
      
      // Click again to close
      fireEvent.click(hamburgerButton.parentElement);
      
      // Mobile menu should be hidden
      expect(document.querySelector('.pb-3.pt-2')).not.toBeInTheDocument();
    });

    it('closes mobile menu when a navigation link is clicked', () => {
      const user = { first_name: 'Test', email: 'test@example.com' };
      renderNavbar(user);
      
      // Open mobile menu
      const hamburgerButton = document.querySelector('button svg');
      fireEvent.click(hamburgerButton.parentElement);
      
      // Click on the Profile link in the mobile menu
      const profileLink = screen.getAllByText('Profile')[1]; // Second occurrence is in mobile menu
      fireEvent.click(profileLink);
      
      // Mobile menu should be closed
      expect(document.querySelector('.pb-3.pt-2')).not.toBeInTheDocument();
    });

    it('calls logout and closes menu when logout is clicked in mobile view', () => {
      const user = { first_name: 'Test', email: 'test@example.com' };
      const logoutMock = vi.fn();
      
      renderNavbar(user, '/', logoutMock);
      
      // Open mobile menu
      const hamburgerButton = document.querySelector('button svg');
      fireEvent.click(hamburgerButton.parentElement);
      
      // Get the logout button from mobile menu (should be the second one)
      const logoutButtons = screen.getAllByText('Logout');
      fireEvent.click(logoutButtons[1]); // Mobile menu logout button
      
      // Check logout was called
      expect(logoutMock).toHaveBeenCalledTimes(1);
      
      // Check mobile menu was closed
      expect(document.querySelector('.pb-3.pt-2')).not.toBeInTheDocument();
    });
  });
});