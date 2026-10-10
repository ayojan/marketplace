import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { AppProvider } from '@/lib/contexts/AppContext';
import { Toaster } from '@/components/ui/sonner';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import '../styles/globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#FAF7F2',
};

export const metadata: Metadata = {
  title: 'Ayoj — Premium Creative & Event Marketplace',
  description: 'Connect with verified photographers, videographers, and event managers for landmark celebrations.',
  keywords: 'ayoj, marketplace, event management, photography, videography, wedding planners',
  icons: {
    icon: '/images/ayoj-icon.svg',
    apple: '/images/ayoj-icon.svg',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ayoj',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.className} antialiased min-h-screen bg-[#FAF7F2] text-[#1C1B19] pb-16 md:pb-0`}>
        <AuthProvider>
          <AppProvider>
            {children}
            <MobileBottomNav />
          </AppProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}