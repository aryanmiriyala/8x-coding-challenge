import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aster Market',
  description: 'A physical-goods storefront',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-canvas text-text">
        <header className="bg-brand-strong text-white p-4">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">Aster Market</h1>
            <nav>
              <ul className="flex space-x-4">
                <li>Search</li>
                <li>Cart</li>
                <li>Account</li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4">{children}</main>
        <footer className="bg-surface p-4 text-center mt-8">
          <p>&copy; 2026 Aster Market</p>
        </footer>
      </body>
    </html>
  );
}
