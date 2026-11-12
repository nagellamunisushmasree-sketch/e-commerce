import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../dist/generated/prisma/client.js';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: 'Wireless Headphones',
    description: 'Comfortable over-ear headphones with clear sound.',
    price: 2499,
    quantity: 20,
    imageUrl: '/products/wireless-headphones.svg',
  },
  {
    name: 'Everyday Cotton T-Shirt',
    description: 'Soft, breathable cotton for everyday wear.',
    price: 799,
    quantity: 40,
    imageUrl: '/products/cotton-tshirt.svg',
  },
  {
    name: 'Canvas Backpack',
    description: 'A durable backpack with room for daily essentials.',
    price: 1799,
    quantity: 25,
    imageUrl: '/products/canvas-backpack.svg',
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Reusable insulated bottle for hot or cold drinks.',
    price: 599,
    quantity: 35,
    imageUrl: '/products/steel-water-bottle.svg',
  },
  {
    name: 'Desk Organizer',
    description: 'Keep stationery and small accessories in order.',
    price: 999,
    quantity: 15,
    imageUrl: '/products/desk-organizer.svg',
  },
  {
    name: 'Ceramic Coffee Mug',
    description: 'A sturdy ceramic mug for coffee, tea, and more.',
    price: 399,
    quantity: 50,
    imageUrl: '/products/ceramic-coffee-mug.svg',
  },
];

try {
  const owner = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    orderBy: { id: 'asc' },
    select: { id: true },
  });

  if (!owner) {
    throw new Error(
      'No admin account exists to own the sample products. Create an admin account first, then run npm run db:seed.',
    );
  }

  let inserted = 0;
  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
      select: { id: true },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { ...product, adminId: owner.id },
      });
      continue;
    }

    await prisma.product.create({
      data: { ...product, adminId: owner.id },
    });
    inserted += 1;
  }

  console.log(
    `Sample inventory ready: inserted ${inserted}, already present ${products.length - inserted}.`,
  );
} finally {
  await prisma.$disconnect();
}
