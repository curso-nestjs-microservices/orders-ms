import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { OrderPatterns } from './enums';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(OrderPatterns.createOrder)
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern(OrderPatterns.findAllOrders)
  findAll() {
    return this.ordersService.findAll();
  }

  @MessagePattern(OrderPatterns.findOneOrder)
  findOne(@Payload() id: number) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern(OrderPatterns.changeStatusOrder)
  changeStatus(@Payload() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.changeStatus(updateOrderDto.id, updateOrderDto);
  }
}
