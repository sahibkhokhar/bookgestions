import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bookgestions - AI-Powered Book Recommendations',
  description: 'Discover your next favorite book with AI-powered recommendations based on your reading preferences.',
  keywords: 'books, recommendations, AI, reading, literature',
  authors: [{ name: 'Sahib Khokhar' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gray-900 text-gray-100`}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
} 