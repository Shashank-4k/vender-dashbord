import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KPICard from '../components/KPICard';

describe('KPICard Component', () => {
  it('renders title and formatted value accurately', () => {
    render(<KPICard title="Procurement Spend" value="$1.25M" subtext="120 Total Orders" />);
    expect(screen.getByText('Procurement Spend')).toBeDefined();
    expect(screen.getByText('$1.25M')).toBeDefined();
    expect(screen.getByText('120 Total Orders')).toBeDefined();
  });

  it('renders trend badge if present', () => {
    render(<KPICard title="Revenue" value="$500K" trend={12} />);
    expect(screen.getByText('+12%')).toBeDefined();
  });
});
