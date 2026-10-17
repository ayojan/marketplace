import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServiceManagement from '../ServiceManagement';
import { apiService } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  apiService: {
    profiles: {
      serviceCategories: jest.fn().mockResolvedValue({
        data: {
          service_categories: [
            { id: 1, name: 'Photography' },
            { id: 2, name: 'Catering' }
          ]
        }
      }),
      me: jest.fn().mockResolvedValue({
        data: {
          categories: [{ id: 1, name: 'Photography', is_primary: true }]
        }
      })
    },
    services: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getById: jest.fn(),
      images: {
        list: jest.fn().mockResolvedValue({ data: { service_images: [] } }),
        upload: jest.fn().mockResolvedValue({ data: { message: 'Image uploaded successfully' } }),
        delete: jest.fn().mockResolvedValue({ data: { message: 'Image deleted successfully' } }),
        setPrimary: jest.fn().mockResolvedValue({ data: { message: 'Primary set' } })
      }
    }
  }
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

const mockServices = [
  {
    id: '1',
    name: 'Candid Wedding Photography',
    description: 'Full day candid wedding photography coverage with color grading.',
    base_price: 45000,
    formatted_price: '₹45,000',
    pricing_type: 'package',
    status: 'active',
    category: {
      id: 1,
      name: 'Photography'
    },
    images: [
      {
        id: 101,
        url: 'https://example.com/service-photo-1.jpg',
        is_primary: true,
        title: 'Wedding stage setup'
      }
    ]
  }
];

describe('ServiceManagement Component with Image Support', () => {
  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders service list with real service photo thumbnail and count', () => {
    render(<ServiceManagement services={mockServices} />);

    expect(screen.getByText('Candid Wedding Photography')).toBeInTheDocument();
    expect(screen.getByText(/1 real service photo uploaded/i)).toBeInTheDocument();
  });

  it('opens create service form and displays real service photos upload dropzone', () => {
    render(<ServiceManagement services={mockServices} />);

    // Click "Add New Service"
    fireEvent.click(screen.getByRole('button', { name: /add new service/i }));

    expect(screen.getByText('Create New Service Listing')).toBeInTheDocument();
    expect(screen.getByText(/Real Service Photos & Showcase/i)).toBeInTheDocument();
    expect(screen.getByText(/Click to browse or drag real service photos/i)).toBeInTheDocument();
  });

  it('allows staging image files for upload when creating a service', async () => {
    render(<ServiceManagement services={mockServices} />);

    fireEvent.click(screen.getByRole('button', { name: /add new service/i }));

    const file = new File(['dummy content'], 'work-sample.jpg', { type: 'image/jpeg' });
    const input = document.getElementById('service-images-input') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/New Photos to Upload on Save/i)).toBeInTheDocument();
      expect(screen.getByText('work-sample.jpg')).toBeInTheDocument();
    });
  });

  it('opens quick photo manager modal from card action', async () => {
    render(<ServiceManagement services={mockServices} />);

    const photoBtn = screen.getByRole('button', { name: /manage real service photos/i });
    fireEvent.click(photoBtn);

    await waitFor(() => {
      expect(screen.getByText('Real Service Photos')).toBeInTheDocument();
      expect(screen.getAllByText('Candid Wedding Photography').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/Upload real photos for this service/i)).toBeInTheDocument();
    });
  });
});
