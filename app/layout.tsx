export const dynamic = "force-dynamic";
import type { Metadata } from 'next';
import './globals.css';
import { getCartItemCount, mergeGuestCart } from '@/lib/actions/cart';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Aster Market',
  description: 'A physical-goods storefront',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = await auth.getSession();
  
  const cookieStore = await cookies();
  const guestToken = cookieStore.get('aster_guest_cart')?.value;
  
  if (session?.user && guestToken) {
    await mergeGuestCart(session.user.id);
  }

  const cartCount = await getCartItemCount();

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased min-h-screen flex flex-col bg-canvas text-text">
        {/* Primary Header */}
        <header className="bg-brand-strong text-white w-full">
          <div className="flex items-center px-4 md:px-8 xl:px-12 py-2 space-x-6 max-w-[1600px] mx-auto w-full">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/">
                <h1 className="text-2xl font-bold tracking-tight">Aster Market</h1>
              </a>
            </div>

            {/* Delivery Context */}
            <div className="hidden md:flex flex-col text-sm hover:outline hover:outline-1 hover:outline-white p-1 cursor-pointer">
              <span className="text-gray-300 text-xs leading-tight">Deliver to</span>
              <span className="font-bold leading-tight">Select your address</span>
            </div>

            {/* Search Bar */}
            <div className="flex-grow flex items-center bg-white rounded-md overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-accent">
              <select className="bg-gray-100 text-black text-sm p-2 border-r border-gray-300 outline-none cursor-pointer hidden sm:block h-10 hover:bg-gray-200">
                <option>All</option>
              </select>
              <input 
                type="text" 
                placeholder="Search Aster Market" 
                className="flex-grow text-black px-3 py-2 outline-none h-10"
              />
              <button className="bg-accent hover:bg-accent-hover px-4 py-2 h-10 text-black font-bold transition-colors">
                Q
              </button>
            </div>

            {/* Account & Lists */}
            <a href={session?.user ? "/account" : "/auth/sign-in"} className="hidden sm:flex flex-col text-sm hover:outline hover:outline-1 hover:outline-white p-1 cursor-pointer whitespace-nowrap">
              <span className="text-gray-300 text-xs leading-tight">Hello, {session?.user?.name ? session.user.name.split(' ')[0] : 'sign in'}</span>
              <span className="font-bold leading-tight">Account & Lists</span>
            </a>

            {/* Returns & Orders */}
            <div className="hidden lg:flex flex-col text-sm hover:outline hover:outline-1 hover:outline-white p-1 cursor-pointer whitespace-nowrap">
              <span className="text-gray-300 text-xs leading-tight">Returns</span>
              <span className="font-bold leading-tight">& Orders</span>
            </div>

            {/* Cart */}
            <a href="/cart" className="flex items-center hover:outline hover:outline-1 hover:outline-white p-1 cursor-pointer relative">
              <div className="text-3xl font-bold leading-none mr-1">🛒</div>
              <span className="font-bold mt-2">Cart</span>
              <span className="absolute left-4 top-1 text-accent font-bold text-lg">{cartCount}</span>
            </a>
          </div>
        </header>

        {/* Secondary Nav */}
        <nav className="bg-brand text-white w-full">
          <div className="flex items-center px-4 md:px-8 xl:px-12 py-1 space-x-4 max-w-[1600px] mx-auto w-full text-sm font-medium">
            <button className="hover:outline hover:outline-1 hover:outline-white p-1 flex items-center">
              <span className="font-bold mr-1">☰</span> All
            </button>
            <a href="#" className="hover:outline hover:outline-1 hover:outline-white p-1">Today&apos;s Deals</a>
            <a href="#" className="hover:outline hover:outline-1 hover:outline-white p-1">Customer Service</a>
            <a href="#" className="hover:outline hover:outline-1 hover:outline-white p-1">Registry</a>
            <a href="#" className="hover:outline hover:outline-1 hover:outline-white p-1">Gift Cards</a>
            <a href="#" className="hover:outline hover:outline-1 hover:outline-white p-1">Sell</a>
          </div>
        </nav>

        <main className="flex-grow">{children}</main>
        
        <footer className="bg-brand-strong text-white py-8 text-center mt-auto">
          <div className="flex justify-center space-x-8 text-sm mb-4">
            <a href="#" className="hover:underline">Conditions of Use</a>
            <a href="#" className="hover:underline">Privacy Notice</a>
            <a href="#" className="hover:underline">Consumer Health Data Privacy Disclosure</a>
          </div>
          <p className="text-sm text-gray-400">&copy; 2026 Aster Market, Inc. or its affiliates</p>
        </footer>
      </body>
    </html>
  );
}
