import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import type { Metadata } from 'next';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!product) return { title: 'Product Not Found - Aster Market' };

  return {
    title: `${product.title} - Aster Market`,
    description: product.description.substring(0, 160),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      images: { orderBy: { sort_order: 'asc' } },
      variants: {
        include: {
          offers: {
            where: { status: 'ACTIVE' },
            include: { seller: true, inventory: true },
          },
        },
      },
    },
  });

  if (!product || product.status !== 'ACTIVE') {
    notFound();
  }

  // P0 logic: just grab the first variant and offer
  const activeVariant = product.variants[0];
  const activeOffer = activeVariant?.offers[0];
  const isAvailable = activeOffer?.inventory && activeOffer.inventory.available > 0;
  
  const bulletPoints = product.bullet_points as string[];

  return (
    <div className="max-w-[1500px] mx-auto p-4 sm:p-6 pb-20 bg-white min-h-screen text-black">
      {/* Breadcrumb mock */}
      <div className="text-sm text-gray-500 mb-6">
        Electronics &gt; Smart Home &gt; {product.brand}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Column: Images */}
        <div className="w-full lg:w-5/12 flex gap-4">
          {/* Thumbnails (desktop only) */}
          <div className="hidden sm:flex flex-col gap-2 w-16 flex-shrink-0">
            {product.images.map((img, idx) => (
              <div key={img.id} className={`w-12 h-12 relative border ${idx === 0 ? 'border-link rounded' : 'border-gray-200'} cursor-pointer hover:border-link`}>
                <Image src={img.url} alt={`Thumb ${idx}`} fill className="object-contain p-1" sizes="48px" />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="relative w-full aspect-square bg-white border-0 sm:border border-gray-100 rounded flex-grow">
            {product.images.length > 0 ? (
              <Image 
                src={product.images[0].url} 
                alt={product.title} 
                fill 
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">No image</div>
            )}
          </div>
        </div>

        {/* Center Column: Details */}
        <div className="w-full lg:w-4/12 flex flex-col">
          <h1 className="text-xl sm:text-2xl font-medium leading-tight mb-1">{product.title}</h1>
          <a href="#" className="text-link text-sm hover:underline hover:text-red-700 mb-2">Visit the {product.brand} Store</a>
          
          <div className="flex items-center text-sm mb-4 border-b border-gray-200 pb-4">
            <span className="text-accent text-lg leading-none mr-1">★</span>
            <span className="text-accent text-lg leading-none mr-1">★</span>
            <span className="text-accent text-lg leading-none mr-1">★</span>
            <span className="text-accent text-lg leading-none mr-1">★</span>
            <span className="text-gray-300 text-lg leading-none mr-2">★</span>
            <span className="text-link text-sm">{product.rating_count.toLocaleString()} ratings</span>
          </div>

          {activeOffer && (
            <div className="mb-4">
              <div className="flex items-baseline mb-2">
                <span className="text-sm align-top mt-1 mr-1">$</span>
                <span className="text-3xl font-bold leading-none">{Math.floor(activeOffer.price_minor / 100)}</span>
                <span className="text-sm align-top mr-2">{String(activeOffer.price_minor % 100).padStart(2, '0')}</span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <span>Returns policy: </span>
                <a href="#" className="text-link hover:underline">Eligible for Return, Refund or Replacement within 30 days of receipt</a>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-bold mb-2">About this item</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
              {Array.isArray(bulletPoints) && bulletPoints.map((bp, i) => (
                <li key={i}>{bp}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Buy Box */}
        <div className="w-full lg:w-3/12">
          <div className="border border-gray-300 rounded-lg p-4 shadow-sm sticky top-4">
            {activeOffer ? (
              <>
                <div className="flex items-baseline mb-2">
                  <span className="text-sm align-top mt-1 mr-1">$</span>
                  <span className="text-3xl font-bold leading-none">{Math.floor(activeOffer.price_minor / 100)}</span>
                  <span className="text-sm align-top">{String(activeOffer.price_minor % 100).padStart(2, '0')}</span>
                </div>

                <div className="text-sm mb-4">
                  <div className="font-bold text-gray-800 mb-1">prime</div>
                  <span className="text-link hover:underline cursor-pointer">FREE delivery</span> <span className="font-bold">Tomorrow</span>. Order within 5 hrs 30 mins
                </div>

                <div className="text-sm flex items-center mb-4 text-link hover:underline cursor-pointer">
                  <span className="mr-1">📍</span>
                  Deliver to - Select your address
                </div>

                <div className="mb-4">
                  {isAvailable ? (
                    <span className="text-green-700 font-medium text-lg">In Stock</span>
                  ) : (
                    <span className="text-red-700 font-medium text-lg">Temporarily out of stock</span>
                  )}
                </div>

                {isAvailable && (
                  <div className="mb-4">
                    <select className="bg-gray-100 border border-gray-300 rounded w-full py-1 px-2 text-sm shadow-sm outline-none">
                      <option>Quantity: 1</option>
                      <option>Quantity: 2</option>
                      <option>Quantity: 3</option>
                    </select>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <button className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-black rounded-full py-2 px-4 text-sm font-medium shadow-sm transition-colors disabled:opacity-50" disabled={!isAvailable}>
                    Add to Cart
                  </button>
                  <button className="w-full bg-[#ffa41c] hover:bg-[#fa8900] text-black rounded-full py-2 px-4 text-sm font-medium shadow-sm transition-colors disabled:opacity-50" disabled={!isAvailable}>
                    Buy Now
                  </button>
                </div>

                <div className="text-xs grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-gray-500 mb-4">
                  <span>Ships from</span>
                  <span className="text-gray-800">Aster Market</span>
                  <span>Sold by</span>
                  <span className="text-link hover:underline">{activeOffer.seller.display_name}</span>
                  <span>Returns</span>
                  <span className="text-link hover:underline">Eligible for Return</span>
                  <span>Payment</span>
                  <span className="text-link hover:underline">Secure transaction</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <button className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-black rounded px-4 py-1.5 text-sm font-medium shadow-sm transition-colors">
                    Add to List
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-gray-600">
                Currently unavailable. <br/>
                <span className="text-sm">We don't know when or if this item will be back in stock.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description / A+ Content Mock */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-bold mb-4">Product Description</h2>
        <div className="max-w-3xl text-sm text-gray-800 leading-relaxed">
          {product.description}
        </div>
      </div>
    </div>
  );
}
