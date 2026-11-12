import { IsString, MinLength } from 'class-validator';

export class AdminRegisterDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(1)
  setupCode: string;
}
