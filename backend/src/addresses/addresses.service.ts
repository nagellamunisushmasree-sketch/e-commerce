import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  getForUser(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createForUser(userId: number, dto: CreateAddressDto) {
    return this.prisma.address.create({
      data: { ...dto, userId },
    });
  }

  async removeForUser(userId: number, id: number) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.address.delete({ where: { id } });
  }
}
