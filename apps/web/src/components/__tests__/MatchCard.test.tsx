import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchCard } from '../MatchCard';
import type { MatchCardProps } from '../MatchCard';

const BASE_PROPS: MatchCardProps = {
  id: 'user-1',
  name: 'Alice Chen',
  role: 'engineer',
  title: 'Senior Software Engineer',
  location: 'London, UK',
};

describe('MatchCard', () => {
  describe('rendering', () => {
    it('renders name and title', () => {
      render(<MatchCard {...BASE_PROPS} />);
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    });

    it('renders location chip', () => {
      render(<MatchCard {...BASE_PROPS} />);
      expect(screen.getByText('London, UK')).toBeInTheDocument();
    });

    it('renders skills list (up to 3)', () => {
      render(
        <MatchCard
          {...BASE_PROPS}
          skills={['TypeScript', 'React', 'Node.js', 'GraphQL']}
        />
      );
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    it('highlights matching skills differently', () => {
      render(
        <MatchCard
          {...BASE_PROPS}
          skills={['TypeScript', 'Python']}
          matchingSkills={['TypeScript']}
        />
      );
      const tsChip = screen.getByText('TypeScript');
      expect(tsChip.className).toContain('success');
    });

    it('renders match reasons with sparkles icon area', () => {
      render(
        <MatchCard
          {...BASE_PROPS}
          matchReasons={['Strong React skills', 'Remote-friendly']}
        />
      );
      expect(screen.getByText('Strong React skills')).toBeInTheDocument();
      expect(screen.getByText('Remote-friendly')).toBeInTheDocument();
    });

    it('renders available badge when available=true', () => {
      render(<MatchCard {...BASE_PROPS} available />);
      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('does not render available badge when available=false', () => {
      render(<MatchCard {...BASE_PROPS} available={false} />);
      expect(screen.queryByText('Available')).not.toBeInTheDocument();
    });
  });

  describe('match score badge', () => {
    it('renders match score arc for score >= 85 (featured/strong)', () => {
      render(<MatchCard {...BASE_PROPS} matchScore={90} />);
      expect(screen.getByRole('img', { name: /match quality: strong/i })).toBeInTheDocument();
    });

    it('renders match score arc for score 65–84 (good)', () => {
      render(<MatchCard {...BASE_PROPS} matchScore={72} />);
      expect(screen.getByRole('img', { name: /match quality: good/i })).toBeInTheDocument();
    });

    it('renders match score arc for score 40–64 (potential)', () => {
      render(<MatchCard {...BASE_PROPS} matchScore={55} />);
      expect(screen.getByRole('img', { name: /match quality: potential/i })).toBeInTheDocument();
    });

    it('renders match score arc for score < 40 (fair)', () => {
      render(<MatchCard {...BASE_PROPS} matchScore={30} />);
      expect(screen.getByRole('img', { name: /match quality: fair/i })).toBeInTheDocument();
    });

    it('does not render score arc when matchScore is undefined', () => {
      render(<MatchCard {...BASE_PROPS} />);
      expect(screen.queryByRole('img', { name: /match quality/i })).not.toBeInTheDocument();
    });
  });

  describe('status states', () => {
    it('shows Interest Sent badge when interestSent=true', () => {
      render(<MatchCard {...BASE_PROPS} interestSent />);
      expect(screen.getByText('Interest Sent')).toBeInTheDocument();
    });

    it('shows Accepted badge when accepted=true', () => {
      render(<MatchCard {...BASE_PROPS} accepted />);
      expect(screen.getByText('Accepted')).toBeInTheDocument();
    });

    it('shows Passed badge when passed=true', () => {
      render(<MatchCard {...BASE_PROPS} passed />);
      expect(screen.getByText('Passed')).toBeInTheDocument();
    });
  });

  describe('action callbacks', () => {
    it('calls onExpressInterest with card id when Express Interest is clicked', () => {
      const onExpressInterest = jest.fn();
      render(<MatchCard {...BASE_PROPS} onExpressInterest={onExpressInterest} />);
      fireEvent.click(screen.getByRole('button', { name: /express interest/i }));
      expect(onExpressInterest).toHaveBeenCalledWith('user-1');
    });

    it('disables Express Interest button when interestSent=true', () => {
      render(<MatchCard {...BASE_PROPS} interestSent onExpressInterest={jest.fn()} />);
      expect(screen.getByRole('button', { name: /express interest/i })).toBeDisabled();
    });

    it('calls onAccept with card id when Accept is clicked', () => {
      const onAccept = jest.fn();
      render(<MatchCard {...BASE_PROPS} onAccept={onAccept} />);
      fireEvent.click(screen.getByRole('button', { name: /accept/i }));
      expect(onAccept).toHaveBeenCalledWith('user-1');
    });

    it('calls onPass with card id when Pass is clicked', () => {
      const onPass = jest.fn();
      render(<MatchCard {...BASE_PROPS} onPass={onPass} />);
      fireEvent.click(screen.getByRole('button', { name: /pass/i }));
      expect(onPass).toHaveBeenCalledWith('user-1');
    });

    it('shows Undo button when passed=true', () => {
      const onPass = jest.fn();
      render(<MatchCard {...BASE_PROPS} passed onPass={onPass} />);
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });
  });
});
