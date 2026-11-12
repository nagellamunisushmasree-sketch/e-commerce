
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
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  price: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
