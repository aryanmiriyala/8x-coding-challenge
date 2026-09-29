import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with more products...');
  
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { slug: 'electronics', name: 'Electronics', description: 'Gadgets' },
  });

  const books = await prisma.category.upsert({
    where: { slug: 'books' },
    update: {},
    create: { slug: 'books', name: 'Books & Kindle', description: 'Reading materials and ereaders' },
  });

  const amazonSeller = await prisma.seller.upsert({
    where: { slug: 'aster-market' },
    update: {},
    create: { slug: 'aster-market', display_name: 'Aster Market' },
  });

  // 1. Echo Dot
  const echoProduct = await prisma.product.upsert({
    where: { slug: 'echo-dot-5th-gen' },
    update: {},
    create: {
      slug: 'echo-dot-5th-gen',
      title: 'Echo Dot (5th Gen) | Smart speaker with Alexa | Charcoal',
      brand: 'Amazon',
      description: 'Our most popular smart speaker.',
      bullet_points: ['Better sound', 'Alexa enabled', 'Smart home controls'],
      status: 'ACTIVE',
      rating_average_hundredths: 470,
      rating_count: 14251,
      search_text: 'Echo Dot',
    },
  });

  const echoVariant = await prisma.productVariant.upsert({
    where: { sku: 'B09B8V1LZ3' },
    update: {},
    create: { sku: 'B09B8V1LZ3', product_id: echoProduct.id, title: 'Echo Dot - Charcoal', attributes: { color: 'Charcoal' } },
  });

  const echoOffer = await prisma.offer.findFirst({ where: { variant_id: echoVariant.id } });
  if (!echoOffer) {
    const o = await prisma.offer.create({ data: { variant_id: echoVariant.id, seller_id: amazonSeller.id, price_minor: 4999, currency: 'USD' } });
    await prisma.inventory.create({ data: { offer_id: o.id, available: 500, version: 1 } });
  }

  // 2. Kindle Paperwhite
  const kindleProduct = await prisma.product.upsert({
    where: { slug: 'kindle-paperwhite' },
    update: {},
    create: {
      slug: 'kindle-paperwhite',
      title: 'Kindle Paperwhite (8 GB) – Now with a 6.8" display and adjustable warm light',
      brand: 'Amazon',
      description: 'Purpose-built for reading with a flush-front design and 300 ppi glare-free display.',
      bullet_points: ['6.8" display', 'Adjustable warm light', 'Up to 10 weeks of battery life', 'Waterproof'],
      status: 'ACTIVE',
      rating_average_hundredths: 480,
      rating_count: 32014,
      search_text: 'Kindle Paperwhite ereader book',
    },
  });

  const kindleVariant = await prisma.productVariant.upsert({
    where: { sku: 'B08KTZ8249' },
    update: {},
    create: { sku: 'B08KTZ8249', product_id: kindleProduct.id, title: 'Kindle Paperwhite 8GB', attributes: { capacity: '8GB' } },
  });

  const kindleOffer = await prisma.offer.findFirst({ where: { variant_id: kindleVariant.id } });
  if (!kindleOffer) {
    const o = await prisma.offer.create({ data: { variant_id: kindleVariant.id, seller_id: amazonSeller.id, price_minor: 13999, currency: 'USD' } });
    await prisma.inventory.create({ data: { offer_id: o.id, available: 120, version: 1 } });
  }

  // 3. Amazon Basics HDMI Cable
  const hdmiProduct = await prisma.product.upsert({
    where: { slug: 'amazon-basics-hdmi' },
    update: {},
    create: {
      slug: 'amazon-basics-hdmi',
      title: 'Amazon Basics High-Speed HDMI Cable, 18 Gbps, 4K/60Hz, 6 Foot, Black',
      brand: 'Amazon Basics',
      description: 'High-speed HDMI cable for connecting devices.',
      bullet_points: ['Contacts are 24K gold-plated', 'Supports 4K video', '6 feet long'],
      status: 'ACTIVE',
      rating_average_hundredths: 460,
      rating_count: 500321,
      search_text: 'HDMI cable amazon basics',
    },
  });

  const hdmiVariant = await prisma.productVariant.upsert({
    where: { sku: 'B014I8SSD0' },
    update: {},
    create: { sku: 'B014I8SSD0', product_id: hdmiProduct.id, title: 'HDMI Cable 6ft', attributes: { length: '6 ft' } },
  });

  const hdmiOffer = await prisma.offer.findFirst({ where: { variant_id: hdmiVariant.id } });
  if (!hdmiOffer) {
    const o = await prisma.offer.create({ data: { variant_id: hdmiVariant.id, seller_id: amazonSeller.id, price_minor: 799, currency: 'USD' } });
    await prisma.inventory.create({ data: { offer_id: o.id, available: 1000, version: 1 } });
  }

  // Links to Categories
  await prisma.productCategory.upsert({
    where: { product_id_category_id: { product_id: kindleProduct.id, category_id: books.id } },
    update: {},
    create: { product_id: kindleProduct.id, category_id: books.id }
  });
  await prisma.productCategory.upsert({
    where: { product_id_category_id: { product_id: hdmiProduct.id, category_id: electronics.id } },
    update: {},
    create: { product_id: hdmiProduct.id, category_id: electronics.id }
  });

  // Images
  const productsToSeed = [
    { id: echoProduct.id, variantId: echoVariant.id, urls: ['https://m.media-amazon.com/images/I/71C3oZIG-5L._AC_SX679_.jpg', 'https://m.media-amazon.com/images/I/61r5fM97EWL._AC_SX679_.jpg'] },
    { id: kindleProduct.id, variantId: kindleVariant.id, urls: ['https://m.media-amazon.com/images/I/711Eos+t2-L._AC_SX679_.jpg', 'https://m.media-amazon.com/images/I/61Z12AUM2pL._AC_SX679_.jpg'] },
    { id: hdmiProduct.id, variantId: hdmiVariant.id, urls: ['https://m.media-amazon.com/images/I/41D8Bv12n4L._AC_SX679_.jpg'] },
  ];

  for (const item of productsToSeed) {
    for (let i = 0; i < item.urls.length; i++) {
      const existing = await prisma.productImage.findFirst({ where: { product_id: item.id, url: item.urls[i] } });
      if (!existing) {
        await prisma.productImage.create({
          data: { product_id: item.id, variant_id: item.variantId, url: item.urls[i], alt_text: `Image ${i}`, sort_order: i }
        });
      }
    }
  }

  console.log('Seeding complete.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
