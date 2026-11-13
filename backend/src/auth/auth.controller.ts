
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ClientLoginDto } from './dto/client-login.dto';
import { ClientRegisterDto } from './dto/client-register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('admin/login')
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Post('client/login')
  clientLogin(@Body() dto: ClientLoginDto) {
    return this.authService.clientLogin(dto);
  }

  @Post('client/register')
  register(@Body() dto: ClientRegisterDto) {
    return this.authService.register(dto);
  }
}
