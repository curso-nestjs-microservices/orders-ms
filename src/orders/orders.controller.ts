import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { OrderPatterns, PaymentPatterns } from './enums';
import {
  ChangeOrderStatusDto,
  CreateOrderDto,
  PaginationOrderDto,
  PaidOrderDto,
} from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(OrderPatterns.createOrder)
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    const paymentSession = await this.ordersService.createPaymentSession(order);

    return { order, paymentSession };
  }

  @MessagePattern(OrderPatterns.findAllOrders)
  findAll(@Payload() paginationOrderDto: PaginationOrderDto) {
    return this.ordersService.findAll(paginationOrderDto);
  }

  @MessagePattern(OrderPatterns.findOneOrder)
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern(OrderPatterns.changeStatusOrder)
  changeStatus(@Payload() changeOrderStatusDto: ChangeOrderStatusDto) {
    return this.ordersService.changeStatus(changeOrderStatusDto);
  }

  @EventPattern(PaymentPatterns.paymentSucceeded)
  paidOrder(@Payload() paidOrderDto: PaidOrderDto) {
    return this.ordersService.handlePaidOrder(paidOrderDto);
  }
}
