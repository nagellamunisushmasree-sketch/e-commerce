import {
  IsInt,
  IsString,
  Max,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RateOrderItemDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  review: string;
}
