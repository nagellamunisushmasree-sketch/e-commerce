
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { SavedItemsService } from './saved-items.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('saved-items')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
export class SavedItemsController {
  constructor(private savedService: SavedItemsService) {}

  @Get()
  getSavedItems(@Req() req: any) {
    return this.savedService.getSavedItems(req.user.userId);
  }

  @Post()
  addSavedItem(
    @Req() req: any,
    @Body('productId', ParseIntPipe) productId: number,
  ) {
    return this.savedService.addSavedItem(req.user.userId, productId);
  }

  @Delete(':id')
  removeSavedItem(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.savedService.removeSavedItem(req.user.userId, id);
  }
}
