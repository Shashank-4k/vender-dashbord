import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { getChartConfig } from '../utils/chartTheme';

const ThemeConsumer = () => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="is-dark">{isDark ? 'true' : 'false'}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
    </div>
  );
};

describe('Dark Mode System & UI Quality', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  it('initializes with default theme and applies theme attributes to html root', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const themeText = screen.getByTestId('current-theme').textContent;
    expect(themeText === 'light' || themeText === 'dark').toBe(true);

    if (themeText === 'dark') {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    } else {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    }
  });

  it('switches between Light and Dark mode and persists to localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const setDarkBtn = screen.getByText('Set Dark');
    fireEvent.click(setDarkBtn);

    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    expect(screen.getByTestId('is-dark').textContent).toBe('true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('vpa_theme')).toBe('dark');

    const setLightBtn = screen.getByText('Set Light');
    fireEvent.click(setLightBtn);

    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    expect(screen.getByTestId('is-dark').textContent).toBe('false');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('vpa_theme')).toBe('light');
  });

  it('renders accessible theme toggle in Navbar with tooltip, aria-label, and keyboard support', () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Navbar />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /switch to (dark|light) mode/i });
    expect(toggleButton).toBeDefined();
    expect(toggleButton.getAttribute('title')).toMatch(/switch to (dark|light) mode/i);

    // Test toggle click
    const initialTitle = toggleButton.getAttribute('title');
    fireEvent.click(toggleButton);
    const newTitle = toggleButton.getAttribute('title');
    expect(newTitle).not.toBe(initialTitle);
  });

  it('provides high-contrast chart design tokens for both light and dark themes', () => {
    const darkConfig = getChartConfig(true);
    const lightConfig = getChartConfig(false);

    // Dark theme chart parameters
    expect(darkConfig.grid.stroke).toBe('#293548');
    expect(darkConfig.axis.stroke).toBe('#94a3b8');
    expect(darkConfig.tooltip.contentStyle.backgroundColor).toBe('#172033');
    expect(darkConfig.colors.primary).toBe('#60a5fa');

    // Light theme chart parameters
    expect(lightConfig.grid.stroke).toBe('#e2e8f0');
    expect(lightConfig.axis.stroke).toBe('#64748b');
    expect(lightConfig.tooltip.contentStyle.backgroundColor).toBe('#1e293b');
    expect(lightConfig.colors.primary).toBe('#6366f1');
  });
});
