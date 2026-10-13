import '@testing-library/jest-dom';

// Global mocks for Next.js App Router navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({ id: '1' })),
}));

// Global mock for next/image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, unoptimized, priority, ...props }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === 'string' ? src : (src?.src || '')} alt={alt || ''} {...props} />;
  };
});