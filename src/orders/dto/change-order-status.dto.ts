import { OrderStatus } from '@prisma/client';
import { IsDefined, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatusList } from '../enums';

export class ChangeOrderStatusDto {
  @IsDefined()
  @IsUUID(4)
  id: string;

  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Valid status are: ${OrderStatusList}`,
  })
  status: OrderStatus;
}
