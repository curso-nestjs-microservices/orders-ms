import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { OrderPatterns } from './enums';
import {
  ChangeOrderStatusDto,
  CreateOrderDto,
  PaginationOrderDto,
} from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(OrderPatterns.createOrder)
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
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
}
