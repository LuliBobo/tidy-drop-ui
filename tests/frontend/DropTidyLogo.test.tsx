import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DropTidyLogo from '@/components/DropTidyLogo';

describe('DropTidyLogo', () => {
  test('renders with default size', () => {
    render(<DropTidyLogo />);
    
    const logo = screen.getByLabelText('DropTidy logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveStyle('height: 36px');
    expect(logo).toHaveStyle('width: 36px');
  });

  test('renders with custom size', () => {
    const customSize = 48;
    render(<DropTidyLogo size={customSize} />);
    
    const logo = screen.getByLabelText('DropTidy logo');
    expect(logo).toHaveStyle(`height: ${customSize}px`);
    expect(logo).toHaveStyle(`width: ${customSize}px`);
  });

  test('contains SVG element with correct viewBox', () => {
    render(<DropTidyLogo />);
    
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 64 64');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  test('has proper accessibility attributes', () => {
    render(<DropTidyLogo />);
    
    const logo = screen.getByLabelText('DropTidy logo');
    expect(logo).toHaveClass('select-none');
    expect(logo).toHaveClass('inline-flex');
    expect(logo).toHaveClass('items-center');
    expect(logo).toHaveClass('justify-center');
  });

  test('SVG scales with size prop', () => {
    const size = 64;
    render(<DropTidyLogo size={size} />);
    
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', size.toString());
    expect(svg).toHaveAttribute('height', size.toString());
  });
});
