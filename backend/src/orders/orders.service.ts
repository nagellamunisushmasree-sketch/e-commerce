
import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrdersService.name);
  private deliveryStatusTimer: NodeJS.Timeout | undefined;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.deliveryStatusTimer = setInterval(() => {
      this.markOrdersDeliveredIfDue({}).catch((error: unknown) => {
        this.logger.error(
          'Unable to update orders due for delivery',
          error instanceof Error ? error.stack : String(error),
        );
      });
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.deliveryStatusTimer) {
      clearInterval(this.deliveryStatusTimer);
    }
  }

  async checkout(userId: number, addressId: number) {
    return this.prisma.$transaction(async (tx) => {
      const address = await tx.address.findFirst({
        where: { id: addressId, userId },
      });

      if (!address) {
        throw new NotFoundException('Delivery address not found');
      }

      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Your cart is empty');
      }

      let total = 0;

      const orderItems = cartItems.map((item) => {
        if (!item.product.isActive) {
          throw new BadRequestException(
            `${item.product.name} is no longer available`,
          );
        }

        if (item.quantity > item.product.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${item.product.name}`,
          );
        }

        const price = Number(item.product.price);

        total += price * item.quantity;

        return {
          productId: item.productId,
          adminId: item.product.adminId,
          quantity: item.quantity,
          unitPrice: price,
        };
      });

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount: total,
          deliveryName: address.recipientName,
          deliveryPhone: address.phone,
          deliveryStreetAddress: address.streetAddress,
          deliveryCity: address.city,
          deliveryState: address.state,
          deliveryPostalCode: address.postalCode,
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });

      for (const item of cartItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            isActive: true,
            quantity: { gte: item.quantity },
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });

        if (updated.count !== 1) {
          throw new BadRequestException(
            'Stock changed during checkout. Please try again.',
          );
        }
      }

      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return {
        message: 'Order placed successfully',
        order,
      };
    });
  }

  async getMyOrders(userId: number) {
    await this.markOrdersDeliveredIfDue({ userId });

    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdminOrders(adminId: number) {
    await this.markOrdersDeliveredIfDue({ adminId });

    return this.prisma.order.findMany({
      where: {
        items: { some: { adminId } },
      },
      include: {
        user: { select: { username: true } },
        items: {
          where: { adminId },
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptOrder(
    adminId: number,
    orderId: number,
    deliveryDate: string,
  ) {
    const parsedDeliveryDate = new Date(`${deliveryDate}T00:00:00.000Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (
      Number.isNaN(parsedDeliveryDate.getTime()) ||
      parsedDeliveryDate < today
    ) {
      throw new BadRequestException('Delivery date must be today or later');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        items: { some: { adminId } },
      },
      select: { id: true, status: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new ConflictException('Only pending orders can be accepted');
    }

    const result = await this.prisma.order.updateMany({
      where: {
        id: orderId,
        status: 'PENDING',
        items: { some: { adminId } },
      },
      data: {
        status: 'PROCESSING',
        acceptedAt: new Date(),
        deliveryDate: parsedDeliveryDate,
      },
    });

    if (result.count !== 1) {
      throw new ConflictException('Order is no longer pending');
    }

    return {
      message: 'Order accepted',
      order: await this.prisma.order.findUnique({
        where: { id: orderId },
      }),
    };
  }

  async getOrderById(userId: number, id: number) {
    await this.markOrdersDeliveredIfDue({ userId });

    return this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  private async markOrdersDeliveredIfDue({
    userId,
    adminId,
  }: {
    userId?: number;
    adminId?: number;
  }) {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await this.prisma.order.updateMany({
      where: {
        status: { in: ['PROCESSING', 'SHIPPED'] },
        deliveryDate: { lt: tomorrow },
        ...(userId !== undefined ? { userId } : {}),
        ...(adminId !== undefined ? { items: { some: { adminId } } } : {}),
      },
      data: { status: 'DELIVERED' },
    });
  }

  async rateOrderItem(
    userId: number,
    orderId: number,
    orderItemId: number,
    rating: number,
    review: string,
  ) {
    await this.markOrdersDeliveredIfDue({ userId });

    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        orderId,
        order: { is: { userId } },
      },
      select: { id: true, order: { select: { status: true } } },
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    if (orderItem.order.status !== 'DELIVERED') {
      throw new ConflictException('You can rate this product after delivery');
    }

    const trimmedReview = review.trim();
    if (!trimmedReview) {
      throw new BadRequestException('Review cannot be empty');
    }

    return this.prisma.orderItem.update({
      where: { id: orderItemId },
      data: { rating, review: trimmedReview },
      select: { id: true, rating: true, review: true },
    });
  }
}
