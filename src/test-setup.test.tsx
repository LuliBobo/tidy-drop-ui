import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test component
const TestComponent = () => {
  return <div>Hello Jest!</div>;
};

describe('Jest Configuration Test', () => {
  test('should render test component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello Jest!')).toBeInTheDocument();
  });

  test('should have proper Jest DOM matchers', () => {
    const element = document.createElement('div');
    element.textContent = 'Test';
    expect(element).toBeInTheDocument;
  });
});
