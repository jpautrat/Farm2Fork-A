import './globals.css';
import { Inter, Montserrat } from 'next/font/google';
import { Providers } from './providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import PWARegister from './pwa-register';
import AnalyticsProvider from '@/components/analytics/AnalyticsProvider';
import ClientOnly from '@/components/ui/ClientOnly';

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata = {
  title: 'Farm2Fork - Fresh Local Food Delivered',
  description: 'Connect with local farmers and get fresh, locally-sourced food delivered to your door.',
  keywords: 'local food, farmers market, organic, fresh produce, food delivery',
  manifest: '/manifest.json',
  themeColor: '#4f7942',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: [
    { rel: 'apple-touch-icon', url: '/icons/icon-192x192.png' },
    { rel: 'icon', url: '/favicon.ico' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        {/* Skip link for keyboard navigation */}
        <a href="#main-content" className="sr-only focus:not-sr-only p-2 bg-primary-600 text-white z-50 fixed top-2 left-2 rounded">
          Skip to main content
        </a>
        <ClientOnly>
          <AnalyticsProvider>
            <Providers>
              <Header />
              <main id="main-content" className="flex-grow">{children}</main>
              <Footer />
              <Toaster position="top-right" />
              <PWARegister />
            </Providers>
          </AnalyticsProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
