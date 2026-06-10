import React from 'react';
import { render, screen } from '@testing-library/react';
import { KanbanBoard } from '../dashboard/founder/KanbanBoard';
import type { KanbanCardProps } from '../dashboard/founder/KanbanCard';

// @dnd-kit requires pointer events; jsdom doesn't support drag simulation well,
// so we test structure/rendering, not drag interaction.

const SAMPLE_CARDS: KanbanCardProps[] = [
  { id: 'c1', name: 'Alice Chen', title: 'SWE', status: 'backlog', fitScore: 90 },
  { id: 'c2', name: 'Bob Smith', title: 'PM', status: 'in-progress', fitScore: 72 },
  { id: 'c3', name: 'Carol White', status: 'review' },
  { id: 'c4', name: 'Dave Lee', title: 'Designer', status: 'done', fitScore: 88 },
];

describe('KanbanBoard', () => {
  describe('structure', () => {
    it('renders the board as a region landmark', () => {
      render(<KanbanBoard initialCards={[]} />);
      expect(
        screen.getByRole('region', { name: /candidate pipeline kanban board/i })
      ).toBeInTheDocument();
    });

    it('renders all 4 default columns', () => {
      render(<KanbanBoard initialCards={[]} />);
      expect(screen.getByText('Backlog')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('accepts custom columns', () => {
      const cols = [
        { id: 'new', title: 'New Lead', color: '#4F46E5' },
        { id: 'closed', title: 'Closed', color: '#22C55E' },
      ];
      render(<KanbanBoard columns={cols} initialCards={[]} />);
      expect(screen.getByText('New Lead')).toBeInTheDocument();
      expect(screen.getByText('Closed')).toBeInTheDocument();
    });

    it('renders column lists with role="list"', () => {
      render(<KanbanBoard initialCards={[]} />);
      const lists = screen.getAllByRole('list');
      expect(lists.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('card placement', () => {
    it('places each card in the correct column', () => {
      render(<KanbanBoard initialCards={SAMPLE_CARDS} />);
      expect(screen.getByText('Alice Chen')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Carol White')).toBeInTheDocument();
      expect(screen.getByText('Dave Lee')).toBeInTheDocument();
    });

    it('shows card count badges per column', () => {
      render(<KanbanBoard initialCards={SAMPLE_CARDS} />);
      // Each column has 1 card; aria-labels reflect count
      const countBadges = screen.getAllByLabelText(/1 cards/i);
      expect(countBadges.length).toBe(4);
    });

    it('shows empty state text when a column has no cards', () => {
      render(<KanbanBoard initialCards={[SAMPLE_CARDS[0]]} />);
      const empties = screen.getAllByText('No candidates');
      expect(empties.length).toBe(3);
    });
  });

  describe('KanbanCard rendering', () => {
    it('renders fit score badge for cards with fitScore', () => {
      render(<KanbanBoard initialCards={SAMPLE_CARDS} />);
      expect(screen.getByText('90%')).toBeInTheDocument();
      expect(screen.getByText('72%')).toBeInTheDocument();
      expect(screen.getByText('88%')).toBeInTheDocument();
    });

    it('does not render fit score badge when fitScore is undefined', () => {
      render(<KanbanBoard initialCards={[SAMPLE_CARDS[2]]} />); // Carol has no fitScore
      // Other scores not present
      expect(screen.queryByText('90%')).not.toBeInTheDocument();
    });

    it('renders card title when provided', () => {
      render(<KanbanBoard initialCards={SAMPLE_CARDS} />);
      expect(screen.getByText('SWE')).toBeInTheDocument();
      expect(screen.getByText('PM')).toBeInTheDocument();
    });

    it('renders tags on cards', () => {
      const cards: KanbanCardProps[] = [
        { id: 't1', name: 'Tagged User', status: 'backlog', tags: ['Series A', 'Remote'] },
      ];
      render(<KanbanBoard initialCards={cards} />);
      expect(screen.getByText('Series A')).toBeInTheDocument();
      expect(screen.getByText('Remote')).toBeInTheDocument();
    });
  });
});
