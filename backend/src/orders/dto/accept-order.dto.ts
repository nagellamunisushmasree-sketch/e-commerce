import { IsDateString } from 'class-validator';

export class AcceptOrderDto {
  @IsDateString()
  deliveryDate: string;
}
