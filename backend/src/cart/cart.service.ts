
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AddCartDto } from './dto/add-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: number) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
  }

  async addToCart(userId: number, dto: AddCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: { userId, productId: dto.productId },
      },
    });

    // Check the total that would be in the cart, not just the added amount.
    const newTotal = (existing?.quantity ?? 0) + dto.quantity;

    if (product.quantity < newTotal) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
      update: {
        quantity: { increment: dto.quantity },
      },
      create: {
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });
  }

  async updateCartItem(
    userId: number,
    id: number,
    quantity: number,
  ) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id, userId },
      include: { product: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (!item.product.isActive) {
      throw new NotFoundException('Product not found');
    }

    if (quantity > item.product.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });
  }

  // Moves a cart line into the user's saved items in one transaction.
  async saveForLater(userId: number, id: number) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.savedItem.upsert({
        where: {
          userId_productId: { userId, productId: item.productId },
        },
        update: {},
        create: { userId, productId: item.productId },
      });

      await tx.cartItem.delete({ where: { id } });

      return { message: 'Moved to saved items' };
    });
  }

  async removeFromCart(userId: number, id: number) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.delete({
      where: { id },
    });
  }
}
