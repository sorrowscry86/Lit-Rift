import React from 'react';
import { render, screen } from '../../utils/testUtils';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  test('renders without crashing', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays default message when no message provided', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('displays custom message when provided', () => {
    render(<LoadingSpinner message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  test('renders in full-page mode', () => {
    const { container } = render(<LoadingSpinner fullPage />);

    // Check for full-page container styles
    const loadingContainer = container.firstChild as HTMLElement;
    expect(loadingContainer).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  test('renders in inline mode by default', () => {
    const { container } = render(<LoadingSpinner />);

    const loadingContainer = container.firstChild as HTMLElement;
    expect(loadingContainer).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  test('renders MUI CircularProgress component', () => {
    render(<LoadingSpinner />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  test('renders with typography for message', () => {
    render(<LoadingSpinner message="Test message" />);

    const message = screen.getByText('Test message');
    expect(message).toBeInTheDocument();
  });

  test('accessibility: has proper ARIA role', () => {
    render(<LoadingSpinner />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('role', 'progressbar');
  });

  test('accessibility: message is visible to screen readers', () => {
    render(<LoadingSpinner message="Loading content" />);

    const message = screen.getByText('Loading content');
    expect(message).toBeVisible();
  });

  test('renders with different size prop', () => {
    const { container } = render(<LoadingSpinner size={60} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  test('renders multiple instances independently', () => {
    const { container } = render(
      <>
        <LoadingSpinner message="Loading A" />
        <LoadingSpinner message="Loading B" />
      </>
    );

    expect(screen.getByText('Loading A')).toBeInTheDocument();
    expect(screen.getByText('Loading B')).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(2);
  });

  test('handles empty message gracefully', () => {
    render(<LoadingSpinner message="" />);

    // Should still render the spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('full-page spinner fills viewport', () => {
    const { container } = render(<LoadingSpinner fullPage />);

    const loadingContainer = container.firstChild as HTMLElement;
    // Should have viewport height
    const styles = window.getComputedStyle(loadingContainer);
    expect(styles.display).toBe('flex');
    expect(styles.justifyContent).toBe('center');
    expect(styles.alignItems).toBe('center');
  });
});
