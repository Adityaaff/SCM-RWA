'use client';

import { useEffect } from 'react';
import './globals.css';
import Header from '../components/Header';
import { WalletProvider } from '../lib/context/WalletContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-black text-gray-800 dark:text-white">
        <WalletProvider>
          <Header />
          <main className="min-h-screen p-8 sm:p-20">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}