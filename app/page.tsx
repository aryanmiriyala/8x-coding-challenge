export const dynamic = "force-dynamic";
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/db/prisma';

// Revalidate occasionally, or make it dynamic if personalized later
export const revalidate = 3600; 

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: {
      images: {
        orderBy: { sort_order: 'asc' },
        take: 1,
      },
      variants: {
        include: {
          offers: {
            where: { status: 'ACTIVE' },
            take: 1,
          },
        },
        take: 1,
      }
    },
    take: 12,
  });

  return (
    <div className="max-w-[1500px] mx-auto p-4 sm:p-6 pb-20">
      
      {/* "Window Display" Hero Section */}
      <div className="relative w-full h-[300px] sm:h-[400px] bg-gradient-to-r from-blue-900 to-indigo-800 rounded-lg overflow-hidden mb-6 flex items-center justify-between px-10 shadow-md">
        <div className="text-white max-w-md z-10">
          <h2 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">Welcome to Aster Market</h2>
          <p className="text-lg mb-6">Discover the best physical goods with reliable, fast delivery.</p>
          <Link href="#" className="bg-accent hover:bg-accent-hover text-black px-6 py-2 rounded font-bold transition-colors">
            Shop now
          </Link>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-4 px-2">Featured Products</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => {
          const mainImage = product.images[0]?.url || 'https://via.placeholder.com/400';
          const firstVariant = product.variants[0];
          const firstOffer = firstVariant?.offers[0];
          const priceStr = firstOffer 
            ? `$${(firstOffer.price_minor / 100).toFixed(2)}` 
            : 'Price unavailable';

          return (
            <Link key={product.id} href={`/product/${product.slug}`} className="group bg-surface rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col p-4">
              {/* Image Container */}
              <div className="relative w-full aspect-square mb-4 bg-white flex items-center justify-center p-4">
                <Image 
                  src={mainImage} 
                  alt={product.title}
                  fill
                  className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col flex-grow">
                <h4 className="font-medium text-text line-clamp-2 mb-2 group-hover:text-link transition-colors">
                  {product.title}
                </h4>

                {/* Rating mock */}
                <div className="flex items-center text-sm mb-1">
                  <span className="text-accent text-lg leading-none mr-1">★</span>
                  <span className="text-lg leading-none mr-1 text-accent">★</span>
                  <span className="text-lg leading-none mr-1 text-accent">★</span>
                  <span className="text-lg leading-none mr-1 text-accent">★</span>
                  <span className="text-lg leading-none mr-1 text-gray-300">★</span>
                  <span className="text-link ml-1">{product.rating_count.toLocaleString()}</span>
                </div>

                {/* Price block */}
                <div className="mt-auto pt-2">
                  <div className="flex items-baseline">
                    <span className="text-sm font-medium mr-1">$</span>
                    <span className="text-2xl font-bold">{firstOffer ? Math.floor(firstOffer.price_minor / 100) : '--'}</span>
                    <span className="text-sm font-medium ml-px">{firstOffer ? (firstOffer.price_minor % 100).toString().padStart(2, '0') : '--'}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="font-bold text-gray-800 mr-1">prime</span>
                    Delivery by Tomorrow
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {products.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No products found. (Did you run the seed script?)
        </div>
      )}
    </div>
  );
}
