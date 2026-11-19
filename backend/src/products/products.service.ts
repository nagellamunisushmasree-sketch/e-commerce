
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getAllProducts(search?: string) {
    const searchTerm = search?.trim();

    return this.prisma.product.findMany({
      where: {
        isActive: true,
        quantity: { gt: 0 },
        ...(searchTerm
          ? {
              name: { contains: searchTerm },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin's own products, including out-of-stock ones.
  async getProductsByAdmin(adminId: number, page: number, pageSize: number) {
    const where = { adminId, isActive: true };
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, pageSize };
  }

  async getProductById(id: number, userId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: {
          where: {
            rating: { not: null },
            order: { is: { status: 'DELIVERED' } },
          },
          select: {
            id: true,
            orderId: true,
            rating: true,
            review: true,
            order: {
              select: {
                userId: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    const { orderItems, ...productDetails } = product;
    const reviews = orderItems.flatMap((item) =>
      item.rating === null
        ? []
        : [
            {
              rating: item.rating,
              review: item.review,
              createdAt: item.order.createdAt,
              canEdit: item.order.userId === userId,
              ...(item.order.userId === userId
                ? { orderId: item.orderId, orderItemId: item.id }
                : {}),
            },
          ],
    );
    const averageRating = reviews.length
      ? reviews.reduce((total, item) => total + item.rating, 0) / reviews.length
      : 0;

    return {
      ...productDetails,
      averageRating,
      ratingCount: reviews.length,
      reviews,
    };
  }

  async createProduct(adminId: number, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...dto,
        price: dto.price,
        adminId,
      },
    });
  }

  async updateProduct(
    id: number,
    adminId: number,
    dto: UpdateProductDto,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    if (product.adminId !== adminId) {
      throw new ForbiddenException('You cannot update this product');
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async deleteProduct(id: number, adminId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.adminId !== adminId) {
      throw new ForbiddenException('You cannot delete this product');
    }

    if (!product.isActive) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.savedItem.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: { isActive: false },
      });
    });
  }
}
