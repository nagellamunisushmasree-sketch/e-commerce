
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  category: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
