import React from 'react';
import { render, screen } from '@testing-library/react';
import { AnalyticsBar } from '../AnalyticsBar';
import type { AnalyticsBarProps } from '../AnalyticsBar';

const SPARKLINE_14 = [10, 12, 8, 15, 20, 18, 22, 19, 25, 23, 28, 30, 27, 32];

const FREELANCER_STATS: AnalyticsBarProps['stats'] = [
  { label: 'Matches Made', value: 24 },
  { label: 'Profile Views', value: 312, delta: '↑ +18 this week' },
  { label: 'Messages Sent', value: 7 },
  { label: 'Response Rate', value: '85%', delta: '↓ -3%', deltaDown: true },
];

const FOUNDER_STATS: AnalyticsBarProps['stats'] = [
  { label: 'Matches Found', value: 11 },
  { label: 'Profile Views', value: 204, delta: '↑ +5 this week' },
  { label: 'Messages Sent', value: 3 },
  { label: 'Investor Reach', value: 8 },
];

describe('AnalyticsBar', () => {
  it('renders the analytics region landmark', () => {
    render(
      <AnalyticsBar role="freelancer" stats={FREELANCER_STATS} sparklineData={SPARKLINE_14} />
    );
    expect(screen.getByRole('region', { name: /analytics summary/i })).toBeInTheDocument();
  });

  describe('freelancer role', () => {
    it('renders all four stat labels', () => {
      render(
        <AnalyticsBar role="freelancer" stats={FREELANCER_STATS} sparklineData={SPARKLINE_14} />
      );
      expect(screen.getByText('Matches Made')).toBeInTheDocument();
      expect(screen.getByText('Profile Views')).toBeInTheDocument();
      expect(screen.getByText('Messages Sent')).toBeInTheDocument();
      expect(screen.getByText('Response Rate')).toBeInTheDocument();
    });

    it('renders stat values', () => {
      render(
        <AnalyticsBar role="freelancer" stats={FREELANCER_STATS} sparklineData={SPARKLINE_14} />
      );
      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getByText('312')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('renders the sparkline SVG with 14 data points', () => {
      render(
        <AnalyticsBar role="freelancer" stats={FREELANCER_STATS} sparklineData={SPARKLINE_14} />
      );
      expect(screen.getByTestId('sparkline-svg')).toBeInTheDocument();
      expect(screen.queryByTestId('sparkline-skeleton')).not.toBeInTheDocument();
    });

    it('uses --color-primary (#4F46E5) as default sparkline color', () => {
      render(
        <AnalyticsBar role="freelancer" stats={FREELANCER_STATS} sparklineData={SPARKLINE_14} />
      );
      const polyline = screen.getByTestId('sparkline-svg').querySelector('polyline');
      expect(polyline).toHaveAttribute('stroke', '#4F46E5');
    });
  });

  describe('founder role', () => {
    it('renders all four stat labels', () => {
      render(
        <AnalyticsBar role="founder" stats={FOUNDER_STATS} sparklineData={SPARKLINE_14} />
      );
      expect(screen.getByText('Matches Found')).toBeInTheDocument();
      expect(screen.getByText('Profile Views')).toBeInTheDocument();
      expect(screen.getByText('Messages Sent')).toBeInTheDocument();
      expect(screen.getByText('Investor Reach')).toBeInTheDocument();
    });

    it('uses --color-success (#10B981) as default sparkline color', () => {
      render(
        <AnalyticsBar role="founder" stats={FOUNDER_STATS} sparklineData={SPARKLINE_14} />
      );
      const polyline = screen.getByTestId('sparkline-svg').querySelector('polyline');
      expect(polyline).toHaveAttribute('stroke', '#10B981');
    });
  });

  describe('sparkline', () => {
    it('shows skeleton shimmer when sparklineData is empty', () => {
      render(
        <AnalyticsBar role="freelancer" stats={FREELANCER_STATS} sparklineData={[]} />
      );
      expect(screen.getByTestId('sparkline-skeleton')).toBeInTheDocument();
      expect(screen.queryByTestId('sparkline-svg')).not.toBeInTheDocument();
    });

    it('renders the polyline with correct number of points', () => {
      render(
        <AnalyticsBar role="freelancer" stats={FREELANCER_STATS} sparklineData={SPARKLINE_14} />
      );
      const polyline = screen.getByTestId('sparkline-svg').querySelector('polyline');
      expect(polyline).toBeInTheDocument();
      const points = polyline!.getAttribute('points')!.trim().split(' ');
      expect(points).toHaveLength(14);
    });

    it('accepts a custom sparklineColor override', () => {
      render(
        <AnalyticsBar
          role="freelancer"
          stats={FREELANCER_STATS}
          sparklineData={SPARKLINE_14}
          sparklineColor="#FF0000"
        />
      );
      const polyline = screen.getByTestId('sparkline-svg').querySelector('polyline');
      expect(polyline).toHaveAttribute('stroke', '#FF0000');
    });
  });

  describe('delta indicators', () => {
    it('renders up-delta without error color', () => {
      const stats = [{ label: 'Profile Views', value: 100, delta: '↑ +18 this week', deltaDown: false }];
      render(
        <AnalyticsBar role="freelancer" stats={stats} sparklineData={SPARKLINE_14} />
      );
      const delta = screen.getByText('↑ +18 this week');
      expect(delta).toBeInTheDocument();
      expect(delta.className).toContain('success');
    });

    it('renders down-delta with error color', () => {
      const stats = [{ label: 'Response Rate', value: '85%', delta: '↓ -3%', deltaDown: true }];
      render(
        <AnalyticsBar role="freelancer" stats={stats} sparklineData={SPARKLINE_14} />
      );
      const delta = screen.getByText('↓ -3%');
      expect(delta).toBeInTheDocument();
      expect(delta.className).toContain('error');
    });

    it('does not render delta element when delta is not provided', () => {
      const stats = [{ label: 'Matches Made', value: 24 }];
      render(
        <AnalyticsBar role="freelancer" stats={stats} sparklineData={SPARKLINE_14} />
      );
      // No delta element rendered for this stat
      expect(screen.queryByText('↑')).not.toBeInTheDocument();
      expect(screen.queryByText('↓')).not.toBeInTheDocument();
    });
  });
});
