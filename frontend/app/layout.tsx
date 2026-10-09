import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { AppProvider } from '@/lib/contexts/AppContext';
import { Toaster } from '@/components/ui/sonner';
import '../styles/globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const metadata = {
  title: 'Ayoj — Premium Creative & Event Marketplace',
  description: 'Connect with verified photographers, videographers, and event managers for landmark celebrations.',
  keywords: 'ayoj, marketplace, event management, photography, videography, wedding planners',
  icons: {
    icon: '/images/ayoj-icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.className} antialiased min-h-screen bg-[#FAF7F2] text-[#1C1B19]`}>
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}