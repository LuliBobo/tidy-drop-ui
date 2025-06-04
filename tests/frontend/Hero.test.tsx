import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Hero from '@/components/Hero';

// Simple test with minimal mocking
describe('Hero Component', () => {
  test('renders without crashing when wrapped with router', () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );
    
    // Just check that the component renders without errors
    expect(document.body).toBeInTheDocument();
  });

  test('displays main content elements', () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );
    
    // Check for the privacy technology label which should be in a single span
    expect(screen.getByText(/Privacy-First Technology/i)).toBeInTheDocument();
    
    // Check for the main heading by finding the h1 element
    const heading = document.querySelector('h1');
    expect(heading).toBeInTheDocument();
  });
});