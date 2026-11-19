
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  DefaultValuePipe,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
//handle the  file uploads
import { diskStorage } from 'multer';
//stores the uploaded files on the server
import { mkdirSync } from 'node:fs';
//create a folder
import { randomUUID } from 'node:crypto';
//unique id 
import { join } from 'node:path';
//creates a vaild path

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
  //private means a property or method can be accessed only inside the class 
  @Post('upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  //check the authentication and authorizations
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  getAllProducts(@Query('search') search?: string) {
    return this.productsService.getAllProducts(search);
  }

  // Must be declared before ':id' so "admin" is not parsed as an id.
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminProducts(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    if (![10, 20, 50, 100].includes(pageSize)) {
      throw new BadRequestException('Page size must be 10, 20, 50, or 100');
    }

    return this.productsService.getProductsByAdmin(
      req.user.userId,
      page,
      pageSize,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  getProduct(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    //parseintpipe is id into a number
    return this.productsService.getProductById(id, req.user.userId);
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
