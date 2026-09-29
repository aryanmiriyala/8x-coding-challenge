export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Shopping Cart - Aster Market',
};

async function getGuestTokenHash(rawToken: string) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export default async function CartPage() {
  const { data: session } = await auth.getSession();
  const userId = session?.user?.id;

  let cart = null;

  if (userId) {
    cart = await prisma.cart.findFirst({
      where: { user_id: userId, status: 'OPEN' },
      include: {
        items: {
          include: {
            offer: {
              include: {
                variant: {
                  include: {
                    product: {
                      include: {
                        images: { orderBy: { sort_order: 'asc' }, take: 1 }
                      }
                    }
                  }
                },
                inventory: true
              }
            }
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });
  } else {
    const cookieStore = await cookies();
    const guestToken = cookieStore.get('aster_guest_cart')?.value;
    if (guestToken) {
      const guestTokenHash = await getGuestTokenHash(guestToken);
      cart = await prisma.cart.findUnique({
        where: { guest_token_hash: guestTokenHash },
        include: {
          items: {
            include: {
              offer: {
                include: {
                  variant: {
                    include: {
                      product: {
                        include: {
                          images: { orderBy: { sort_order: 'asc' }, take: 1 }
                        }
                      }
                    }
                  },
                  inventory: true
                }
              }
            },
            orderBy: { created_at: 'desc' }
          }
        }
      });
    }
  }

  const items = cart?.status === 'OPEN' ? cart.items : [];
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalMinor = items.reduce((acc, item) => acc + (item.offer.price_minor * item.quantity), 0);

  return (
    <div className="max-w-[1500px] mx-auto p-4 sm:p-6 pb-20 bg-gray-100 min-h-screen text-black flex flex-col lg:flex-row gap-6">
      {/* Left Column: Cart Items */}
      <div className="flex-grow">
        <div className="bg-white p-6 rounded shadow-sm">
          <h1 className="text-2xl font-medium mb-1">Shopping Cart</h1>
          {items.length > 0 ? (
            <div className="text-sm text-right text-gray-500 mb-2 border-b border-gray-200 pb-1">Price</div>
          ) : (
            <div className="border-b border-gray-200 pb-4">
              Your Aster Market Cart is empty.
            </div>
          )}

          {items.map(item => {
            const product = item.offer.variant.product;
            const mainImage = product.images[0]?.url || 'https://via.placeholder.com/150';
            const priceStr = `$${(item.offer.price_minor / 100).toFixed(2)}`;

            return (
              <div key={item.id} className="py-4 border-b border-gray-200 flex gap-4">
                <div className="w-32 h-32 sm:w-48 sm:h-48 relative flex-shrink-0">
                  <Image src={mainImage} alt={product.title} fill className="object-contain" sizes="192px" />
                </div>
                <div className="flex-grow flex flex-col justify-start">
                  <div className="flex justify-between items-start mb-1">
                    <Link href={`/product/${product.slug}`} className="text-lg font-medium text-link hover:underline line-clamp-2">
                      {product.title}
                    </Link>
                    <span className="font-bold text-lg ml-4">{priceStr}</span>
                  </div>
                  <div className="text-sm text-green-700 mb-1">
                    {item.offer.inventory && item.offer.inventory.available > 0 ? 'In Stock' : 'Out of Stock'}
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    Eligible for FREE Shipping & FREE Returns
                  </div>

                  <div className="flex items-center gap-4 mt-auto">
                    <div className="flex items-center bg-gray-100 rounded border border-gray-300 shadow-sm">
                      <select defaultValue={item.quantity} className="bg-transparent text-sm p-1.5 outline-none cursor-pointer">
                        <option value={1}>Qty: 1</option>
                        <option value={2}>Qty: 2</option>
                        <option value={3}>Qty: 3</option>
                        <option value={4}>Qty: 4</option>
                        <option value={5}>Qty: 5</option>
                      </select>
                    </div>
                    <span className="text-gray-300">|</span>
                    <button className="text-link text-sm hover:underline">Delete</button>
                    <span className="text-gray-300">|</span>
                    <button className="text-link text-sm hover:underline">Save for later</button>
                  </div>
                </div>
              </div>
            );
          })}

          {items.length > 0 && (
            <div className="text-right pt-4 text-lg">
              Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''}): <span className="font-bold">${(subtotalMinor / 100).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Checkout Sidebar */}
      {items.length > 0 && (
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white p-5 rounded shadow-sm">
            <div className="text-lg mb-4">
              Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''}): <span className="font-bold">${(subtotalMinor / 100).toFixed(2)}</span>
            </div>
            <button className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-black rounded-full py-2 px-4 text-sm font-medium shadow-sm transition-colors">
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
