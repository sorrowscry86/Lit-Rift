import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterCard from '../../components/StoryBible/CharacterCard';
import { Character } from '../../services/storyBibleService';

describe('CharacterCard Component', () => {
  const mockCharacter: Character = {
    id: 'char1',
    name: 'Test Hero',
    description: 'A brave warrior',
    traits: ['brave', 'strong', 'clever'],
    backstory: 'Born in a small village',
    notes: 'Main character',
    relationships: {},
    appearances: [],
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
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
    expect(screen.getByText('A brave warrior')).toBeInTheDocument();
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
    const minimalCharacter: Character = {
      id: 'char2',
      name: 'Minimal Character',
      description: '',
      traits: [],
      backstory: '',
      notes: '',
      relationships: {},
      appearances: [],
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    };

    render(
      <CharacterCard
        character={minimalCharacter}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Minimal Character')).toBeInTheDocument();
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
