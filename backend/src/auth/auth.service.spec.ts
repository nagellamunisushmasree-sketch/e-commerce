import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../common/enums/user-role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    loginLog: {
      create: vi.fn(),
    },
  } as unknown as PrismaService;
  const jwtService = {
    signAsync: vi.fn().mockResolvedValue('token'),
  } as unknown as JwtService;
  const config = {
    getOrThrow: vi.fn().mockReturnValue('secret'),
  } as unknown as ConfigService;
  const service = new AuthService(prisma, jwtService, config);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(jwtService.signAsync).mockResolvedValue('token');
    vi.mocked(config.getOrThrow).mockReturnValue('secret');
  });

  it('authenticates the fixed admin credentials and provisions an admin identity', async () => {
    const admin = {
      id: 1,
      username: 'admin',
      password: 'hashed-password',
      role: UserRole.ADMIN,
    };
    vi.mocked(prisma.user.upsert).mockResolvedValue(admin as never);

    await expect(
      service.adminLogin({ username: 'admin', password: 'admin@123' }),
    ).resolves.toMatchObject({
      access_token: 'token',
      role: UserRole.ADMIN,
      username: 'admin',
    });

    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { username: 'admin' },
        create: expect.objectContaining({ role: UserRole.ADMIN }),
      }),
    );
    expect(prisma.loginLog.create).toHaveBeenCalledWith({
      data: { userId: 1, role: UserRole.ADMIN },
    });
  });

  it('uses the shared login for admins and clients', async () => {
    const admin = {
      id: 1,
      username: 'admin',
      password: 'hashed-password',
      role: UserRole.ADMIN,
    };
    vi.mocked(prisma.user.upsert).mockResolvedValue(admin as never);

    await expect(
      service.login({ username: 'admin', password: 'admin@123' }),
    ).resolves.toMatchObject({ role: UserRole.ADMIN });

    const password = 'client@123';
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 2,
      username: 'client',
      password: await bcrypt.hash(password, 4),
      role: UserRole.CLIENT,
    } as never);

    await expect(
      service.login({ username: 'client', password }),
    ).resolves.toMatchObject({ role: UserRole.CLIENT });
  });

  it('authenticates registered clients but rejects admin-role accounts', async () => {
    const password = 'client@123';
    const client = {
      id: 2,
      username: 'client',
      password: await bcrypt.hash(password, 4),
      role: UserRole.CLIENT,
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(client as never);

    await expect(
      service.clientLogin({ username: 'client', password }),
    ).resolves.toMatchObject({ role: UserRole.CLIENT });

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...client,
      role: UserRole.ADMIN,
    } as never);
    await expect(
      service.clientLogin({ username: 'client', password }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      service.clientLogin({ username: 'admin', password: 'admin@123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...client,
      username: 'admin',
      password: await bcrypt.hash('admin@123', 4),
      role: UserRole.CLIENT,
    } as never);
    await expect(
      service.clientLogin({ username: 'admin', password: 'admin@123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects incorrect admin credentials and reserves the admin username', async () => {
    await expect(
      service.adminLogin({ username: 'admin', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.upsert).not.toHaveBeenCalled();

    await expect(
      service.register({ username: 'Admin', password: 'client@123' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
