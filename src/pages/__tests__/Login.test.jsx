// src/pages/__tests__/Login.test.jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Login from '../Login';

// Mock react-router-dom's useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

// Create a mock navigate function
const navigateMock = vi.fn();

// Helper function to render Login with context providers
const renderLogin = (loginFn = vi.fn()) => {
  return render(
    <AuthContext.Provider value={{ login: loginFn }}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form correctly', () => {
    renderLogin();
    
    // Check for page title and form elements
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in$/i })).toBeInTheDocument();
  });

  it('has link to registration page', () => {
    renderLogin();
    const registerLink = screen.getByText('create a new account');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.getAttribute('href')).toBe('/register');
  });

  it('updates form values when typing', () => {
    renderLogin();
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('submits form with correct values', async () => {
    const loginMock = vi.fn().mockResolvedValue({});
    renderLogin(loginMock);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in$/i }));
    
    // Check that login was called with correct values
    expect(loginMock).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
  });

  it('shows loading state during submission', async () => {
    // Create a login function that doesn't resolve immediately
    const loginMock = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({}), 100);
      });
    });
    
    renderLogin(loginMock);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in$/i }));
    
    // Check for loading state
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
    });
  });

  it('navigates to profile page on successful login', async () => {
    const loginMock = vi.fn().mockResolvedValue({});
    renderLogin(loginMock);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in$/i }));
    
    // Wait for login to complete
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/profile');
    });
  });

  it('shows error message when login fails', async () => {
    // Mock login to reject with error
    const errorMessage = 'Invalid username or password';
    const loginMock = vi.fn().mockRejectedValue({
      response: {
        data: {
          message: errorMessage
        }
      }
    });
    
    renderLogin(loginMock);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in$/i }));
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows generic error message when response has no specific message', async () => {
    // Mock login to reject with generic error
    const loginMock = vi.fn().mockRejectedValue({});
    
    renderLogin(loginMock);
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in$/i }));
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    });
  });

  it('clears previous error when submitting the form again', async () => {
    // First mock to fail
    const loginMock = vi.fn()
      .mockRejectedValueOnce({
        response: {
          data: {
            message: 'Invalid username or password'
          }
        }
      })
      // Then succeed on second call
      .mockResolvedValueOnce({});
    
    renderLogin(loginMock);
    
    // Fill and submit form - this should fail
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in$/i }));
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    });
    
    // Submit again - should clear error
    fireEvent.click(screen.getByRole('button', { name: /sign in$/i }));
    
    // Error should be gone
    expect(screen.queryByText('Invalid username or password')).not.toBeInTheDocument();
  });

  it('disables the submit button during form submission', async () => {
    const loginMock = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({}), 100);
      });
    });
    
    renderLogin(loginMock);
    
    const submitButton = screen.getByRole('button', { name: /sign in$/i });
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Button should be disabled during submission
    expect(submitButton).toBeDisabled();
    
    // Wait for login to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('has alternative login options', () => {
    renderLogin();
    
    expect(screen.getByText('Or continue with')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });

  it('has "Remember me" checkbox', () => {
    renderLogin();
    
    const rememberCheckbox = screen.getByLabelText('Remember me');
    expect(rememberCheckbox).toBeInTheDocument();
    expect(rememberCheckbox.checked).toBe(false);
    
    fireEvent.click(rememberCheckbox);
    expect(rememberCheckbox.checked).toBe(true);
  });

  it('has "Forgot your password" link', () => {
    renderLogin();
    
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    expect(forgotPasswordLink).toBeInTheDocument();
  });
});