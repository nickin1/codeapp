import type { Metadata } from "next";
import { Providers } from './providers';
import Navbar from './components/layout/Navbar';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SearchProvider } from '@/app/context/SearchContext';

export const metadata: Metadata = {
  title: "Scriptorium",
  description: "Write, execute, and share code in multiple programming languages",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-900">
        <SearchProvider>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              {children}
            </div>
          </Providers>
        </SearchProvider>
        <Toaster />
      </body>
    </html>
  );
}