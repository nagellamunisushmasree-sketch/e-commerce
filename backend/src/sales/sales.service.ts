
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async getAdminSales(adminId: number) {
    const items = await this.prisma.orderItem.findMany({
      where: {
        adminId,
        order: {
          status: { not: 'CANCELLED' },
        },
      },
      include: {
        product: true,
        order: {
          select: {
            id: true,
            userId: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        order: { createdAt: 'desc' },
      },
    });

    const totalSales = items.reduce(
      (sum, item) =>
        sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    return {
      totalOrders: new Set(items.map((item) => item.orderId)).size,
      totalProductsSold: items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
      totalSales,
      sales: items,
    };
  }
}
