
import { IsInt, Min } from 'class-validator';

export class AddCartDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
