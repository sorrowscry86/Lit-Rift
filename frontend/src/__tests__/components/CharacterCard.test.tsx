import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterCard } from '../../components/StoryBible/CharacterCard';

describe('CharacterCard Component', () => {
  const mockCharacter = {
    id: 'char1',
    name: 'Test Hero',
    role: 'Protagonist',
    description: 'A brave warrior',
    traits: ['brave', 'strong', 'clever'],
    backstory: 'Born in a small village',
    notes: 'Main character'
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it('renders character information correctly', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Hero')).toBeInTheDocument();
    expect(screen.getByText('Protagonist')).toBeInTheDocument();
  });

  it('displays character traits', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('brave')).toBeInTheDocument();
    expect(screen.getByText('strong')).toBeInTheDocument();
    expect(screen.getByText('clever')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByLabelText(/edit/i);
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockCharacter.id);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockCharacter.id);
  });

  it('renders without optional fields', () => {
    const minimalCharacter = {
      id: 'char2',
      name: 'Minimal Character',
      role: 'Supporting',
      description: '',
      traits: [],
      backstory: '',
      notes: ''
    };

    render(
      <CharacterCard
        character={minimalCharacter}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Minimal Character')).toBeInTheDocument();
    expect(screen.getByText('Supporting')).toBeInTheDocument();
  });

  it('displays description when present', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('A brave warrior')).toBeInTheDocument();
  });

  it('has accessible buttons', () => {
    render(
      <CharacterCard
        character={mockCharacter}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByLabelText(/edit/i);
    const deleteButton = screen.getByLabelText(/delete/i);

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });
});
