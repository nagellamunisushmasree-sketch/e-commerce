
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedItemsService {
  constructor(private prisma: PrismaService) {}

  async getSavedItems(userId: number) {
    return this.prisma.savedItem.findMany({
      where: { userId },
      include: { product: true },
    });
  }

  async addSavedItem(userId: number, productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.savedItem.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      update: {},
      create: { userId, productId },
    });
  }

  async removeSavedItem(userId: number, id: number) {
    const item = await this.prisma.savedItem.findFirst({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException('Saved item not found');
    }

    return this.prisma.savedItem.delete({
      where: { id },
    });
  }
}
