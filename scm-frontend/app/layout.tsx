// app/layout.tsx
import './globals.css';
import Header from '../components/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-black text-gray-800 dark:text-white">
        <Header />
        <main className="min-h-screen p-8 sm:p-20">{children}</main>
      </body>
    </html>
  );
}