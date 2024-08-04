import { Order, OrderStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { OrderStatusList } from '../enums';

export class CreateOrderDto
  implements Omit<Order, 'id' | 'paid' | 'paidAt' | 'createdAt' | 'updatedAt'>
{
  @IsNumber()
  @IsPositive()
  totalAmt: number;

  @IsNumber()
  @IsPositive()
  totalItems: number;

  @IsEnum(OrderStatusList, {
    message: `Posible status values are: ${OrderStatusList}`,
  })
  @IsOptional()
  status: OrderStatus = OrderStatus.PENDING;
}
