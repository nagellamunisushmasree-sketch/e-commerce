
import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Get('admin')
  getAdminSales(@Req() req: any) {
    return this.salesService.getAdminSales(req.user.userId);
  }
}
