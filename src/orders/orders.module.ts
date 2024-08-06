import { Module } from '@nestjs/common';
import { NatsModule } from 'src/transports/nats.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [NatsModule],
})
export class OrdersModule {}
