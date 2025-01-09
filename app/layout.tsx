import type { Metadata } from "next";
import { Providers } from './providers';
import Navbar from './components/layout/Navbar';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SearchProvider } from '@/app/context/SearchContext';

export const metadata: Metadata = {
  title: "App",
  description: "Write, execute, and share code templates",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background min-h-screen">
        <SearchProvider>
          <Providers>
            <div className="flex flex-col min-h-screen bg-background">
              <Navbar />
              <div className="pt-16">
                {children}
              </div>
            </div>
          </Providers>
        </SearchProvider>
        <Toaster />
      </body>
    </html>
  );
}