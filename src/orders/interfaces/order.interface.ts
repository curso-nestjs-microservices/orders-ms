import { OrderStatus } from '@prisma/client';

export interface IOrderItem {
  productId: number;
  quantity: number;
  price: number;
  name?: string;
}

export interface IOrder {
  id: string;
  totalAmt: number;
  totalItems: number;
  status: OrderStatus;
  paid: boolean;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  OrderItem: IOrderItem[];
}
