import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { OrdersService } from '../src/orders/orders.service.js';

function requiredTestSetting(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set to run database integration tests`);
  }
  return value;
}

describe('Order acceptance (database integration)', () => {
  let prisma: PrismaService | undefined;
  let service: OrdersService;
  let adminId: number | undefined;
  let clientId: number | undefined;
  let productId: number | undefined;
  let orderId: number | undefined;

  beforeAll(async () => {
    const databaseName = requiredTestSetting('TEST_DATABASE_NAME');
    if (!/(^|[_-])test($|[_-])/i.test(databaseName)) {
      throw new Error(
        'TEST_DATABASE_NAME must contain a standalone "test" segment; refusing to connect',
      );
    }

    const db = new PrismaService(
      new ConfigService({
        DATABASE_HOST: requiredTestSetting('TEST_DATABASE_HOST'),
        DATABASE_PORT: requiredTestSetting('TEST_DATABASE_PORT'),
        DATABASE_USER: requiredTestSetting('TEST_DATABASE_USER'),
        DATABASE_PASSWORD: requiredTestSetting('TEST_DATABASE_PASSWORD'),
        DATABASE_NAME: databaseName,
      }),
    );
    prisma = db;
    await db.$connect();
    service = new OrdersService(db);

    const admin = await db.user.create({
      data: {
        username: `order-test-admin-${randomUUID()}`,
        password: 'integration-test-only',
        role: 'ADMIN',
      },
    });
    adminId = admin.id;

    const client = await db.user.create({
      data: {
        username: `order-test-client-${randomUUID()}`,
        password: 'integration-test-only',
        role: 'CLIENT',
      },
    });
    clientId = client.id;

    const product = await db.product.create({
      data: {
        name: 'Order acceptance integration test product',
        price: 12.5,
        quantity: 2,
        adminId: admin.id,
      },
    });
    productId = product.id;

    const order = await db.order.create({
      data: {
        userId: client.id,
        totalAmount: 12.5,
        items: {
          create: [
            {
              productId: product.id,
              adminId: admin.id,
              quantity: 1,
              unitPrice: 12.5,
            },
          ],
        },
      },
    });
    orderId = order.id;
  });

  afterAll(async () => {
    const db = prisma;
    if (!db) return;

    if (orderId !== undefined) {
      await db.orderItem.deleteMany({ where: { orderId } });
      await db.order.deleteMany({ where: { id: orderId } });
    }
    if (productId !== undefined) {
      await db.product.deleteMany({ where: { id: productId } });
    }
    if (adminId !== undefined) {
      await db.user.deleteMany({ where: { id: adminId } });
    }
    if (clientId !== undefined) {
      await db.user.deleteMany({ where: { id: clientId } });
    }
    await db.$disconnect();
  });

  it('uses database-generated IDs and persists the accepted status', async () => {
    const db = prisma;
    if (!db || adminId === undefined || orderId === undefined) {
      throw new Error('Integration test records were not created');
    }

    await service.acceptOrder(adminId, orderId);

    const savedOrder = await db.order.findUnique({
      where: { id: orderId },
    });
    expect(savedOrder?.status).toBe('PROCESSING');
  });
});
