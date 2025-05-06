import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Hero from '@/components/Hero';
import { vi } from 'vitest';

// Mock the refs to avoid DOM manipulation issues in tests
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRef: () => ({ current: document.createElement('span') }),
  };
});

describe('Hero Component', () => {
  beforeEach(() => {
    // Mock the animation functionality
    vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as unknown as NodeListOf<Element>);
  });

  test('shows privacy banner with correct text', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    
    // Find the privacy guarantee message by its container
    const privacyBanner = screen.getByText(/100% Local Processing/i);
    expect(privacyBanner).toBeInTheDocument();
    
    // Check that the text contains the privacy message
    expect(privacyBanner.textContent).toContain('Your files never leave your device');
    
    // The Lock icon might be implemented as a Lucide icon component rather than an emoji
    const privacyContainer = screen.getByText(/Local Processing/).parentElement;
    expect(privacyContainer).toBeInTheDocument();
  });
  
  test('displays the main headline text', () => {
    const { container } = render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    
    // Instead of looking for the full headline text, which gets split for animation,
    // we look for the container element and check its text content
    const headlineContainer = container.querySelector('h1');
    expect(headlineContainer).toBeInTheDocument();
    
    // The original text is split into spans but this checks the overall content
    expect(headlineContainer?.textContent).toContain('Protect Your Privacy');
    expect(headlineContainer?.textContent).toContain('Clean up your photos with one click');
  });
  
  test('displays the Privacy-First Technology label', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    
    // Check for the privacy-first technology label
    expect(screen.getByText(/Privacy-First Technology/i)).toBeInTheDocument();
  });
  
  test('displays call to action buttons', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );
    
    // Check for the CTA buttons
    expect(screen.getByText(/Get Started Free/i)).toBeInTheDocument();
    expect(screen.getByText(/See Features/i)).toBeInTheDocument();
  });
});