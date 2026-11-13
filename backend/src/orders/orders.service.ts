
import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async checkout(userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Your cart is empty');
      }

      let total = 0;

      const orderItems = cartItems.map((item) => {
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

  async acceptOrder(adminId: number, orderId: number) {
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
      data: { status: 'PROCESSING' },
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
    return this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }
}
