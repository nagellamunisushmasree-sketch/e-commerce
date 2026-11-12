
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { SavedItemsModule } from './saved-items/saved-items.module';
import { OrdersModule } from './orders/orders.module';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    SavedItemsModule,
    OrdersModule,
    SalesModule,
  ],
})
export class AppModule {}
