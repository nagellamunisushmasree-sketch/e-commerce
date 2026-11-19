import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Controller('addresses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get()
  getAddresses(@Req() req: any) {
    return this.addressesService.getForUser(req.user.userId);
  }

  @Post()
  createAddress(@Req() req: any, @Body() dto: CreateAddressDto) {
    return this.addressesService.createForUser(req.user.userId, dto);
  }

  @Delete(':id')
  removeAddress(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressesService.removeForUser(req.user.userId, id);
  }
}
