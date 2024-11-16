import type { Metadata } from "next";
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import './globals.css';

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
        <AuthProvider>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              {children}
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}