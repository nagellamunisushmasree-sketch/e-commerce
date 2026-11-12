
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

  async getAllProducts() {
    return this.prisma.product.findMany({
      where: { quantity: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin's own products, including out-of-stock ones.
  async getProductsByAdmin(adminId: number) {
    return this.prisma.product.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
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

    if (!product) {
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

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
