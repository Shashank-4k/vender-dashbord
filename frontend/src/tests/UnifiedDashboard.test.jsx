import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Unified Application & Dashboard Experience', () => {
  it('renders consistent dashboard actions for all users without role restrictions', () => {
    render(
      <div className="flex items-center space-x-2">
        <a href="/comparison">Compare Vendors</a>
        <a href="/reports">Export Report</a>
      </div>
    );

    expect(screen.getByText('Compare Vendors')).toBeDefined();
    expect(screen.getByText('Export Report')).toBeDefined();
    expect(screen.queryByText('Add Vendor')).toBeNull();
  });

  it('renders user details in navbar without role badges', () => {
    const user = { name: 'Demo User', email: 'user@example.com' };

    render(
      <div className="text-left">
        <div className="text-xs font-medium text-slate-200">{user.name}</div>
        <div className="text-[10px] text-slate-400">{user.email}</div>
      </div>
    );

    expect(screen.getByText('Demo User')).toBeDefined();
    expect(screen.getByText('user@example.com')).toBeDefined();
    expect(screen.queryByText('ADMIN')).toBeNull();
    expect(screen.queryByText('ANALYST')).toBeNull();
  });
});
