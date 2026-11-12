
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CartService } from './cart.service';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post()
  addToCart(@Req() req: any, @Body() dto: AddCartDto) {
    return this.cartService.addToCart(req.user.userId, dto);
  }

  @Patch(':id')
  updateCart(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateCartItem(
      req.user.userId,
      id,
      dto.quantity,
    );
  }

  @Post(':id/save-for-later')
  saveForLater(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartService.saveForLater(req.user.userId, id);
  }

  @Delete(':id')
  removeFromCart(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartService.removeFromCart(req.user.userId, id);
  }
}
