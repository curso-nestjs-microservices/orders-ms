import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, PRODUCTS_MS } from 'src/config';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    ClientsModule.register([
      {
        name: PRODUCTS_MS,
        transport: Transport.TCP,
        options: { host: envs.productsHost, port: envs.productsPort },
      },
    ]),
  ],
})
export class OrdersModule {}
