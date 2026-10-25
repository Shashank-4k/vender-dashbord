import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SignUp from '../pages/SignUp';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

describe('Authentication Pages (SignUp and Login)', () => {
  it('renders SignUp form with all required fields and no default credentials', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <SignUp />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Create an Account')).toBeDefined();
    expect(screen.getByPlaceholderText('e.g. Jane Doe')).toBeDefined();
    expect(screen.getByPlaceholderText('name@company.com')).toBeDefined();
    expect(screen.getByPlaceholderText('Minimum 6 characters')).toBeDefined();
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeDefined();
    expect(screen.getByRole('button', { name: /create account/i })).toBeDefined();
    expect(screen.getByText(/already registered\?/i)).toBeDefined();
  });

  it('renders Login form with clean empty inputs and no demo credentials box', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Vendor Performance Analytics')).toBeDefined();
    expect(screen.getByPlaceholderText('name@company.com')).toBeDefined();
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
    expect(screen.getByRole('button', { name: /sign in to dashboard/i })).toBeDefined();
    expect(screen.getByText(/don't have an account\?/i)).toBeDefined();

    // Verify default demo credentials box is NOT rendered
    expect(screen.queryByText(/demo credentials/i)).toBeNull();
    expect(screen.queryByText(/admin@vendoranalytics.com/i)).toBeNull();
  });
});

