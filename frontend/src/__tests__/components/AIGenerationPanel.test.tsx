import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIGenerationPanel from '../../components/Editor/AIGenerationPanel';

describe('AIGenerationPanel Component', () => {
  const mockOnGenerate = jest.fn();
  const mockSceneContext = {
    characters: [
      { id: 'char1', name: 'Hero', role: 'Protagonist' }
    ],
    location: { id: 'loc1', name: 'Kingdom' },
    lore: [],
    plotPoints: []
  };

  beforeEach(() => {
    mockOnGenerate.mockClear();
  });

  it('renders generation controls', () => {
    render(
      <AIGenerationPanel
        sceneContext={mockSceneContext}
        onGenerate={mockOnGenerate}
        generating={false}
      />
    );

    expect(screen.getByLabelText(/prompt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/length/i)).toBeInTheDocument();
  });

  it('displays scene context information', () => {
    render(
      <AIGenerationPanel
        sceneContext={mockSceneContext}
        onGenerate={mockOnGenerate}
        generating={false}
      />
    );

    expect(screen.getByText(/Hero/i)).toBeInTheDocument();
    expect(screen.getByText(/Kingdom/i)).toBeInTheDocument();
  });

  it('calls onGenerate with correct data when form is submitted', async () => {
    render(
      <AIGenerationPanel
        sceneContext={mockSceneContext}
        onGenerate={mockOnGenerate}
        generating={false}
      />
    );

    const promptInput = screen.getByLabelText(/prompt/i);
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } });

    const generateButton = screen.getByText(/generate/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'Test prompt'
        })
      );
    });
  });

  it('disables form when generating', () => {
    render(
      <AIGenerationPanel
        sceneContext={mockSceneContext}
        onGenerate={mockOnGenerate}
        generating={true}
      />
    );

    const generateButton = screen.getByText(/generating/i);
    expect(generateButton).toBeDisabled();
  });

  it('allows tone selection', async () => {
    render(
      <AIGenerationPanel
        sceneContext={mockSceneContext}
        onGenerate={mockOnGenerate}
        generating={false}
      />
    );

    const toneSelect = screen.getByLabelText(/tone/i);
    fireEvent.mouseDown(toneSelect);

    await waitFor(() => {
      expect(screen.getByText('Dramatic')).toBeInTheDocument();
    });
  });

  it('allows length selection', () => {
    render(
      <AIGenerationPanel
        sceneContext={mockSceneContext}
        onGenerate={mockOnGenerate}
        generating={false}
      />
    );

    const lengthSelect = screen.getByLabelText(/length/i);
    expect(lengthSelect).toBeInTheDocument();
  });

  it('shows empty state when no context', () => {
    const emptyContext = {
      characters: [],
      location: null,
      lore: [],
      plotPoints: []
    };

    render(
      <AIGenerationPanel
        sceneContext={emptyContext}
        onGenerate={mockOnGenerate}
        generating={false}
      />
    );

    expect(screen.getByText(/no context/i)).toBeInTheDocument();
  });
});
