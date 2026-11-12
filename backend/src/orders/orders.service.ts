
import {
  Injectable,
  BadRequestException,
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
