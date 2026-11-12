
import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  checkout(@Req() req: any) {
    return this.ordersService.checkout(req.user.userId);
  }

  @Get('my-orders')
  getMyOrders(@Req() req: any) {
    return this.ordersService.getMyOrders(req.user.userId);
  }

  @Get(':id')
  getOrder(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.getOrderById(req.user.userId, id);
  }
}
