
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../common/enums/user-role.enum';
import { UserRole as PrismaUserRole } from '../generated/prisma/enums';
import { LoginDto } from './dto/login.dto';
import { ClientRegisterDto } from './dto/client-register.dto';
import * as bcrypt from 'bcrypt';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin@123';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    if (dto.username.toLowerCase() === ADMIN_USERNAME) {
      return this.adminLogin(dto);
    }

    return this.clientLogin(dto);
  }

  async register(dto: ClientRegisterDto) {
    if (dto.username.toLowerCase() === ADMIN_USERNAME) {
      throw new ConflictException('Username is reserved');
    }

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

  async adminLogin(dto: LoginDto) {
    if (dto.username !== ADMIN_USERNAME || dto.password !== ADMIN_PASSWORD) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const user = await this.prisma.user.upsert({
      where: { username: ADMIN_USERNAME },
      create: {
        username: ADMIN_USERNAME,
        password,
        role: UserRole.ADMIN,
      },
      update: {},
    });

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return this.createSession(user);
  }

  async clientLogin(dto: LoginDto) {
    if (dto.username.toLowerCase() === ADMIN_USERNAME) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (!user || user.role !== UserRole.CLIENT) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    return this.createSession(user);
  }

  private async createSession(user: {
    id: number;
    username: string;
    role: PrismaUserRole;
  }) {
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
