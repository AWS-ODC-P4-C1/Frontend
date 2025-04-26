import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
import EditProfile from '../EditProfile';
import { describe, it, expect, vi } from 'vitest';

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const mockNavigate = vi.fn();

describe('EditProfile', () => {
  // eslint-disable-next-line no-undef
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when user is not available', () => {
    render(
      <AuthContext.Provider value={{ currentUser: null }}>
        <EditProfile />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the edit profile form with user data', () => {
    const mockUser = {
      username: 'johndoe',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe'
    };

    render(
      <AuthContext.Provider value={{ currentUser: mockUser }}>
        <BrowserRouter>
          <EditProfile />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Check if form fields are populated correctly
    const usernameInput = screen.getByLabelText(/Username/i);
    expect(usernameInput).toHaveValue('johndoe');
    
    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toHaveValue('john@example.com');
    expect(emailInput).toHaveAttribute('readOnly');
    
    const firstNameInput = screen.getByLabelText(/First name/i);
    expect(firstNameInput).toHaveValue('John');
    
    const lastNameInput = screen.getByLabelText(/Last name/i);
    expect(lastNameInput).toHaveValue('Doe');
  });

  it('handles form input changes', () => {
    const mockUser = {
      username: 'johndoe',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe'
    };

    render(
      <AuthContext.Provider value={{ currentUser: mockUser }}>
        <BrowserRouter>
          <EditProfile />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.change(usernameInput, { target: { value: 'johndoe_updated' } });
    expect(usernameInput).toHaveValue('johndoe_updated');
    
    const firstNameInput = screen.getByLabelText(/First name/i);
    fireEvent.change(firstNameInput, { target: { value: 'Johnny' } });
    expect(firstNameInput).toHaveValue('Johnny');
  });

  it('submits form data and navigates on success', async () => {
    const mockUser = {
      username: 'johndoe',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe'
    };

    const mockUpdateProfile = vi.fn().mockResolvedValue({});

    render(
      <AuthContext.Provider value={{ currentUser: mockUser, updateProfile: mockUpdateProfile }}>
        <BrowserRouter>
          <EditProfile />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Update username
    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.change(usernameInput, { target: { value: 'johndoe_updated' } });
    
    // Submit the form
    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    // Wait for the update to complete
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        username: 'johndoe_updated',
        email: 'john@example.com',
        first_name: 'John',
        last_name: 'Doe'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  it('shows error on failed profile update', async () => {
    const mockUser = {
      username: 'johndoe',
      email: 'john@example.com'
    };

    const mockError = { response: { data: { message: 'Update failed' } } };
    const mockUpdateProfile = vi.fn().mockRejectedValue(mockError);

    render(
      <AuthContext.Provider value={{ currentUser: mockUser, updateProfile: mockUpdateProfile }}>
        <BrowserRouter>
          <EditProfile />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Submit the form without making changes
    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    // Check for error message
    const errorMessage = await screen.findByText('Update failed');
    expect(errorMessage).toBeInTheDocument();
  });

  it('redirects to profile when cancel button is clicked', () => {
    const mockUser = {
      username: 'johndoe',
      email: 'john@example.com'
    };

    render(
      <AuthContext.Provider value={{ currentUser: mockUser }}>
        <BrowserRouter>
          <EditProfile />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // Click the cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Verify navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});