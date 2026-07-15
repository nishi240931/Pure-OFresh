import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Pure O Fresh | Organic Fruits, Vegetables & Grocery Delivery',
  description: 'Pure O Fresh delivers 100% organic, farm-fresh fruits, crispy vegetables, pure dairy, eggs, and daily essentials. Sourced directly from local farms and delivered to your doorstep in 1 hour.',
  keywords: 'organic, groceries, fresh fruits, vegetables, food delivery, daily essentials, green groceries, pure fresh, swiggy instamart, blinkit',
  authors: [{ name: 'Pure O Fresh team' }],
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
  },
};

import CatalogInitializer from '@/components/CatalogInitializer';
import StorefrontLayout from '@/components/StorefrontLayout';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${outfit.variable} h-full scroll-smooth antialiased`}
      >
        <body className="min-h-full flex flex-col bg-white text-slate-800 antialiased font-sans selection:bg-primary/20 selection:text-primary-dark">
          <CatalogInitializer />
          <StorefrontLayout>{children}</StorefrontLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
