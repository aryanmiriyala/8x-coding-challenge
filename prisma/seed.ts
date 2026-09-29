import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create default category
  const electronicsCategory = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      slug: 'electronics',
      name: 'Electronics',
      description: 'Gadgets and electronic devices',
    },
  });

  const smartHomeCategory = await prisma.category.upsert({
    where: { slug: 'smart-home' },
    update: {},
    create: {
      slug: 'smart-home',
      name: 'Smart Home',
      description: 'Smart home automation devices',
      parent_id: electronicsCategory.id,
    },
  });

  // Create default seller
  const amazonSeller = await prisma.seller.upsert({
    where: { slug: 'aster-market' },
    update: {},
    create: {
      slug: 'aster-market',
      display_name: 'Aster Market',
    },
  });

  // Create Echo Dot Product
  const echoProduct = await prisma.product.upsert({
    where: { slug: 'echo-dot-5th-gen' },
    update: {},
    create: {
      slug: 'echo-dot-5th-gen',
      title: 'Echo Dot (5th Gen, 2022 release) | Smart speaker with Alexa | Charcoal',
      brand: 'Amazon',
      description: 'Our most popular smart speaker features a sleek design and improved audio for vibrant sound anywhere in your home.',
      bullet_points: [
        'OUR BEST SOUNDING ECHO DOT YET - Enjoy an improved audio experience compared to any previous Echo Dot with Alexa for clearer vocals, deeper bass and vibrant sound in any room.',
        'YOUR FAVORITE MUSIC AND CONTENT - Play music, audiobooks, and podcasts from Amazon Music, Apple Music, Spotify and others or via Bluetooth throughout your home.',
        'ALEXA IS READY TO HELP - Ask Alexa for weather updates, to set hands-free timers, get answers to your questions and even hear jokes.',
        'DO MORE WITH COMPATIBLE SMART HOME DEVICES - Control compatible smart home devices with your voice and routines triggered by built-in indoor temperature or motion sensors.',
      ],
      status: 'ACTIVE',
      rating_average_hundredths: 470, // 4.70
      rating_count: 14251,
      search_text: 'Echo Dot 5th Gen 2022 release Smart speaker with Alexa Charcoal Amazon electronics smart home audio',
    },
  });

  // Link Product to Categories
  await prisma.productCategory.upsert({
    where: {
      product_id_category_id: {
        product_id: echoProduct.id,
        category_id: smartHomeCategory.id,
      }
    },
    update: {},
    create: {
      product_id: echoProduct.id,
      category_id: smartHomeCategory.id,
    }
  });

  // Create Variant
  const echoVariant = await prisma.productVariant.upsert({
    where: { sku: 'B09B8V1LZ3' },
    update: {},
    create: {
      sku: 'B09B8V1LZ3',
      product_id: echoProduct.id,
      title: 'Echo Dot (5th Gen) - Charcoal',
      attributes: { color: 'Charcoal' },
    },
  });

  // Create Images
  // In P0, we use public mock placeholders or real Amazon image URLs if they were part of the "discovery pictures".
  // Since we don't have local images yet, we'll use a placeholder representing the Echo Dot.
  const imageUrls = [
    'https://m.media-amazon.com/images/I/71C3oZIG-5L._AC_SX679_.jpg', // Main image
    'https://m.media-amazon.com/images/I/61r5fM97EWL._AC_SX679_.jpg', // Side view
  ];

  for (let i = 0; i < imageUrls.length; i++) {
    // Upsert isn't as trivial without a unique constraint on url+product_id, so we just check first
    const existingImage = await prisma.productImage.findFirst({
      where: { product_id: echoProduct.id, url: imageUrls[i] }
    });
    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          product_id: echoProduct.id,
          variant_id: echoVariant.id,
          url: imageUrls[i],
          alt_text: `Echo Dot Image ${i + 1}`,
          sort_order: i,
        }
      });
    }
  }

  // Create Offer
  const echoOffer = await prisma.offer.findFirst({
    where: { variant_id: echoVariant.id, seller_id: amazonSeller.id }
  });

  let offerId = echoOffer?.id;

  if (!echoOffer) {
    const newOffer = await prisma.offer.create({
      data: {
        variant_id: echoVariant.id,
        seller_id: amazonSeller.id,
        price_minor: 4999, // $49.99
        compare_at_minor: 4999,
        currency: 'USD',
      }
    });
    offerId = newOffer.id;
  }

  // Set Inventory
  if (offerId) {
    await prisma.inventory.upsert({
      where: { offer_id: offerId },
      update: { available: 500 },
      create: {
        offer_id: offerId,
        available: 500,
        version: 1,
      }
    });
  }

  console.log('Seeded Amazon Echo Dot.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
