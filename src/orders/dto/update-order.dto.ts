import { IsDefined, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrderDto {
  @IsDefined()
  @IsPositive()
  @Type(() => Number)
  id: number;

  @IsDefined()
  @IsString()
  status: string;
}
