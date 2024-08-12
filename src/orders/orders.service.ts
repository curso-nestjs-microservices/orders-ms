import { Order, OrderStatus, PrismaClient } from '@prisma/client';
import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import {
  ChangeOrderStatusDto,
  CreateOrderDto,
  PaginationOrderDto,
  PaidOrderDto,
} from './dto';
import { PaymentPatterns, ProductPatterns } from './enums';
import { IOrder, IProduct } from './interfaces';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected!');
  }

  async create(createOrderDto: CreateOrderDto) {
    const productIds = createOrderDto.items.map((item) => item.productId);

    try {
      // * Validar que los productos existan
      const products = await this._validateProducts({
        ids: productIds,
      });

      // * Calcular totales
      const { totalAmount, totalItems } = this._calculateTotals({
        order: createOrderDto,
        products: products,
      });

      // * Transacción en la DB
      const order: IOrder = await this.order.create({
        data: {
          totalAmt: totalAmount,
          totalItems: totalItems,
          OrderItem: {
            createMany: {
              data: this._mapOrderCreationData({
                order: createOrderDto,
                products: products,
              }),
            },
          },
        },
        include: { OrderItem: true },
      });

      return this._mapOrderCreationResp({ order, products });
    } catch (error) {
      throw new RpcException(error);
    }
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
    const order: IOrder = await this.order.findFirst({
      where: { id },
      include: { OrderItem: true },
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id '${id}' not found`,
      });
    }

    const products = await this._validateProducts({
      ids: order.OrderItem.map((orderItem) => orderItem.productId),
      includeDeleted: true,
    });

    return this._mapOrderCreationResp({ order, products });
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

  async createPaymentSession(order: Required<IOrder>) {
    const paymentSession = await firstValueFrom(
      this.client.send(PaymentPatterns.createPaymentSession, {
        orderId: order.id,
        currency: 'usd',
        items: order.OrderItem.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      }),
    );

    return paymentSession;
  }

  async handlePaidOrder(paidOrderDto: PaidOrderDto) {
    const updatedOrder = await this.order.update({
      where: { id: paidOrderDto.orderId },
      data: {
        status: OrderStatus.PAID,
        paid: true,
        paidAt: new Date(),
        stripeChargeId: paidOrderDto.stripeChargeId,

        // Relation
        OrderReceipt: {
          create: {
            receiptUrl: paidOrderDto.receiptUrl,
          },
        },
      },
    });

    return updatedOrder;
  }

  private _validateProducts({
    ids,
    includeDeleted = false,
  }: {
    ids: number[];
    includeDeleted?: boolean;
  }) {
    return firstValueFrom(
      this.client.send<IProduct[]>(
        { cmd: ProductPatterns.validateProducts },
        { ids, ...(!includeDeleted && { enabled: true }) },
      ),
    );
  }

  private _calculateTotals({
    order,
    products,
  }: {
    order: CreateOrderDto;
    products: IProduct[];
  }) {
    const totalAmount = order.items.reduce((_, orderItem) => {
      const { price } = products.find(
        (product) => product.id === orderItem.productId,
      );

      return price * orderItem.quantity;
    }, 0);

    const totalItems = order.items.reduce((acc, orderItem) => {
      return acc + orderItem.quantity;
    }, 0);

    return { totalAmount, totalItems };
  }

  private _mapOrderCreationData({
    order,
    products,
  }: {
    order: CreateOrderDto;
    products: IProduct[];
  }) {
    return order.items.map((orderItem) => {
      const dbPrice = products.find(
        (product) => product.id === orderItem.productId,
      ).price;

      return {
        productId: orderItem.productId,
        quantity: orderItem.quantity,
        price: dbPrice,
      };
    });
  }

  private _mapOrderCreationResp({
    order,
    products,
  }: {
    order: IOrder;
    products: IProduct[];
  }) {
    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        productId: orderItem.productId,
        quantity: orderItem.quantity,
        price: orderItem.price,
        name: products.find((product) => product.id === orderItem.productId)
          .name,
      })),
    };
  }
}
