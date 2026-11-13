
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../common/enums/user-role.enum';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ClientLoginDto } from './dto/client-login.dto';
import { ClientRegisterDto } from './dto/client-register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: ClientRegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: UserRole.CLIENT,
      },
    });

    return {
      message: 'Client registered successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async adminLogin(dto: AdminLoginDto) {
    return this.login(dto, UserRole.ADMIN);
  }

  async clientLogin(dto: ClientLoginDto) {
    return this.login(dto, UserRole.CLIENT);
  }

  private async login(
    dto: AdminLoginDto | ClientLoginDto,
    requiredRole: UserRole,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user || user.role !== requiredRole) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid username or password');
    }
 
    // Every successful login (admin or client) is stored in SQL.
    await this.prisma.loginLog.create({
      data: {
        userId: user.id,
        role: user.role,
      },
    });

    const access_token = await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
      },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: '1d',
      },
    );

    return {
      access_token,
      role: user.role,
      username: user.username,
    };
  }
}
