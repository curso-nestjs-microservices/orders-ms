import { OmitType } from '@nestjs/mapped-types';
import { OrderStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Order } from '../entities';
import { OrderStatusList } from '../enums';

export class CreateOrderDto extends OmitType(Order, ['id'] as const) {
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

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => [1, '1', true, 'true'].includes(value))
  paid: boolean = false;
}
