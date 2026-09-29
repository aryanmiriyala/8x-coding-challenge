'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

const GUEST_CART_COOKIE = 'aster_guest_cart';

async function getGuestTokenHash(rawToken: string) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export async function addToCart(offerId: string, quantity: number = 1) {
  const { data: session } = await auth.getSession();
  const userId = session?.user?.id;

  let cart;

  if (userId) {
    // Upsert customer profile just in case it doesn't exist
    await prisma.customerProfile.upsert({
      where: { auth_user_id: userId },
      update: {},
      create: { auth_user_id: userId, role: 'CUSTOMER' },
    });

    cart = await prisma.cart.findFirst({
      where: { user_id: userId, status: 'OPEN' },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: userId, status: 'OPEN' },
      });
    }
  } else {
    // Guest cart logic
    const cookieStore = await cookies();
    let guestToken = cookieStore.get(GUEST_CART_COOKIE)?.value;

    if (!guestToken) {
      guestToken = crypto.randomUUID();
      cookieStore.set(GUEST_CART_COOKIE, guestToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    const guestTokenHash = await getGuestTokenHash(guestToken);

    cart = await prisma.cart.findUnique({
      where: { guest_token_hash: guestTokenHash },
    });

    if (!cart || cart.status !== 'OPEN') {
      cart = await prisma.cart.create({
        data: { guest_token_hash: guestTokenHash, status: 'OPEN' },
      });
    }
  }

  // Upsert the cart item
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cart_id_offer_id: {
        cart_id: cart.id,
        offer_id: offerId,
      },
    },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cart_id: cart.id,
        offer_id: offerId,
        quantity,
      },
    });
  }

  revalidatePath('/');
  revalidatePath('/cart');
}

export async function mergeGuestCart(userId: string) {
  const cookieStore = await cookies();
  const guestToken = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!guestToken) return;

  const guestTokenHash = await getGuestTokenHash(guestToken);
  
  const guestCart = await prisma.cart.findUnique({
    where: { guest_token_hash: guestTokenHash },
    include: { items: true },
  });

  if (!guestCart || guestCart.status !== 'OPEN' || guestCart.items.length === 0) {
    return;
  }

  let userCart = await prisma.cart.findFirst({
    where: { user_id: userId, status: 'OPEN' },
    include: { items: true },
  });

  if (!userCart) {
    userCart = await prisma.cart.create({
      data: { user_id: userId, status: 'OPEN' },
      include: { items: true },
    });
  }

  // Merge items
  for (const item of guestCart.items) {
    const existingUserItem = userCart.items.find(i => i.offer_id === item.offer_id);
    if (existingUserItem) {
      await prisma.cartItem.update({
        where: { id: existingUserItem.id },
        data: { quantity: existingUserItem.quantity + item.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cart_id: userCart.id,
          offer_id: item.offer_id,
          quantity: item.quantity,
        },
      });
    }
  }

  await prisma.cart.update({
    where: { id: guestCart.id },
    data: { status: 'MERGED' },
  });

  cookieStore.delete(GUEST_CART_COOKIE);
}

export async function getCartItemCount() {
  const { data: session } = await auth.getSession();
  const userId = session?.user?.id;
  
  let cartId = null;

  if (userId) {
    const userCart = await prisma.cart.findFirst({
      where: { user_id: userId, status: 'OPEN' },
      select: { id: true }
    });
    cartId = userCart?.id;
  } else {
    const cookieStore = await cookies();
    const guestToken = cookieStore.get(GUEST_CART_COOKIE)?.value;
    if (guestToken) {
      const guestTokenHash = await getGuestTokenHash(guestToken);
      const guestCart = await prisma.cart.findUnique({
        where: { guest_token_hash: guestTokenHash },
        select: { id: true, status: true }
      });
      if (guestCart?.status === 'OPEN') {
        cartId = guestCart.id;
      }
    }
  }

  if (!cartId) return 0;

  const aggregate = await prisma.cartItem.aggregate({
    where: { cart_id: cartId },
    _sum: { quantity: true },
  });

  return aggregate._sum.quantity || 0;
}
