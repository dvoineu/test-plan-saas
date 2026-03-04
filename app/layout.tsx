import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/infrastructure/state/QueryProvider';
import { Sidebar } from '@/ui/layout/Sidebar';
import { ThemeProvider } from '@/ui/layout/ThemeProvider';

export const metadata: Metadata = {
  title: 'Test Management Tool',
  description: 'Local Test Management Tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `if (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes(' electron/')) document.documentElement.classList.add('is-electron');`
        }} />
      </head>
      <body className="flex h-screen overflow-hidden bg-background font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex flex-col h-screen overflow-hidden bg-background">
              <div className="electron-titlebar h-[40px] w-full shrink-0 bg-muted/20 border-b z-50 flex items-center justify-center">
                <div className="text-xs font-semibold text-muted-foreground electron-titlebar-content">
                  Test Plan Manager
                </div>
              </div>
              <div className="flex flex-1 overflow-hidden relative">
                <Sidebar />
                <main className="flex-1 overflow-hidden">
                  {children}
                </main>
              </div>
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
