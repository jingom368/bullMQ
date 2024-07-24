import { Module } from '@nestjs/common';
// import { BullModule } from '@nestjs/bullmq';
import { BullModule } from '@taskforcesh/nestjs-bullmq-pro';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { VideoProcessingProcessor } from './video-processing.processor';
// import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { VideoQueueRepository } from './video.queue.repository';
import { jobChildrenProcessingProcessor } from './jobchildren-processing.processor';
import { VideoDBRepository } from './video.db.repository';
import { HealthModule } from './health/health.module';
import { JobProcessor } from './job.processor';
// import { VideoProcessingProcessor2 } from './video-processing.processor2';
import { ConnectorProService } from './connector-pro.service';

@Module({
  imports: [
    HealthModule,
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'jobQueue',
      },
      { name: 'jobChildrenQueue' },
    ),
    BullModule.registerFlowProducer({
      name: 'flowProducerName',
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'jobQueue',
      adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
    BullBoardModule.forFeature({
      name: 'jobChildrenQueue',
      adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
    }),
    // ClientsModule.register([
    //   {
    //     name: 'MATH_SERVICE',
    //     transport: Transport.REDIS,
    //     options: {
    //       host: 'localhost',
    //       port: 6379,
    //     },
    //   },
    // ]),
    RedisModule.forRoot({
      config: {
        name: 'REDIS',
        host: 'localhost',
        port: 6379,
      },
    }),
    HealthModule,
  ],
  controllers: [VideoController],
  providers: [
    VideoService,
    VideoQueueRepository,
    VideoDBRepository,
    VideoProcessingProcessor,
    // VideoProcessingProcessor2,
    jobChildrenProcessingProcessor,
    JobProcessor,
    ConnectorProService,
  ],
})
export class AppModule {}