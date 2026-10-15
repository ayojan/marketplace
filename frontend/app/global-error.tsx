'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#FBF8F4',
          color: '#221F1C',
        }}
      >
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '1rem',
              backgroundColor: '#F3EADF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              color: '#9E5338',
              fontSize: '1.75rem',
            }}
          >
            !
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: '#221F1C',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: '#6B6560',
              marginBottom: '1.75rem',
              maxWidth: '440px',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
            }}
          >
            An unexpected error occurred while loading this page. Please try refreshing or return home.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: '#9E5338',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              style={{
                backgroundColor: '#F3EADF',
                color: '#221F1C',
                border: '1px solid #E8E2D9',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
