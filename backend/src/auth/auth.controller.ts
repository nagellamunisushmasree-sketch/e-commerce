
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ClientRegisterDto } from './dto/client-register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('admin/login')
  adminLogin(@Body() dto: LoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Post('client/login')
  clientLogin(@Body() dto: LoginDto) {
    return this.authService.clientLogin(dto);
  }

  @Post('client/register')
  register(@Body() dto: ClientRegisterDto) {
    return this.authService.register(dto);
  }
}
