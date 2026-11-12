
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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post('upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          const uploadsDirectory = join(process.cwd(), 'uploads');
          mkdirSync(uploadsDirectory, { recursive: true });
          callback(null, uploadsDirectory);
        },
        filename: (_req, file, callback) => {
          const extensionByMimeType: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'image/gif': '.gif',
          };
          callback(
            null,
            `${randomUUID()}${extensionByMimeType[file.mimetype] ?? ''}`,
          );
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = new Set([
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
        ]);
        if (!allowedMimeTypes.has(file.mimetype)) {
          callback(new BadRequestException('Upload a JPG, PNG, WEBP, or GIF image'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadProductImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('An image file is required');
    }

    return { imageUrl: `/uploads/${file.filename}` };
  }

  @Get()
  getAllProducts() {
    return this.productsService.getAllProducts();
  }

  // Must be declared before ':id' so "mine" is not parsed as an id.
  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getMyProducts(@Req() req: any) {
    return this.productsService.getProductsByAdmin(req.user.userId);
  }

  @Get(':id')
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProductById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createProduct(@Req() req: any, @Body() dto: CreateProductDto) {
    return this.productsService.createProduct(req.user.userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(
      id,
      req.user.userId,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.productsService.deleteProduct(
      id,
      req.user.userId,
    );
  }
}
