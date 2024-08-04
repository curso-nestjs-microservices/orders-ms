import { OrderStatus } from '@prisma/client';

export class Order {
  id: number;
  totalAmt: number;
  totalItems: number;

  status: OrderStatus;
  paid?: boolean;
  paidAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
