import { Order, PrismaClient } from '@prisma/client';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  ChangeOrderStatusDto,
  CreateOrderDto,
  PaginationOrderDto,
} from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected!');
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({
      data: createOrderDto,
    });
  }

  async findAll({ page, limit, status }: PaginationOrderDto) {
    const filter = { where: { status } };
    const total = await this.order.count(filter);
    const totalPages = Math.ceil(total / limit);

    const orders: Order[] = [];

    if (page <= totalPages) {
      const ordersFound = await this.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        ...filter,
      });

      orders.push(...ordersFound);
    }

    return {
      data: orders,
      metadata: {
        page: page,
        pagination: limit,
        totalPages: totalPages,
        total: total,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: { id },
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id '${id}' not found`,
      });
    }

    return order;
  }

  async changeStatus({ id, status }: ChangeOrderStatusDto) {
    const order = await this.findOne(id);

    if (order.status === status) {
      return order;
    }

    return this.order.update({
      where: { id },
      data: { status },
    });
  }
}
