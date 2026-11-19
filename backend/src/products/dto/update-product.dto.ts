
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  price?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
