// // import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'; // Adjusted import
// // import { Job } from 'bullmq';
// import { JobPro, WorkerPro } from '@taskforcesh/bullmq-pro';
// // import { InjectRedis } from '@liaoliaots/nestjs-redis';
// // import Redis from 'ioredis';
// import { VideoService } from './video.service';
// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class VideoProcessingProcessor2 {
//   private worker: WorkerPro;

//   constructor(
//     // @InjectRedis() private readonly redis: Redis, // 'REDIS' 이름으로 Redis 클라이언트 주입
//     private readonly videoService: VideoService,
//   ) {
//     this.initializeWorker();
//   }

//   private initializeWorker() {
//     const queueName = 'jobQueue';
//     this.worker = new WorkerPro(queueName, this.process.bind(this), {
//       concurrency: 1,
//       ttl: 10000,
//       connection: {
//         host: 'localhost',
//         port: 6380,
//       },
//     });

//     this.worker.on('failed', (job, err) => {
//       console.log(
//         `[Unknown Type] Failed job ${job.id} of type ${job.name}: ${err.message}`,
//       );
//     });

//     this.worker.on('active', job => {
//       console.log(
//         `[Unknown Type] Active job ${job.id}, ${job.data.videoId} of ${job.data.groupId}`,
//       );
//       // Additional logic for active jobs
//     });
//   }

//   // Adjusted method signature to match the expected signature from WorkerHost
//   async process(job: JobPro): Promise<any> {
//     console.log('jobname', job.name);
//     switch (job.name) {
//       case 'transcode':
//         const time = 10000;
//         await new Promise(resolve => setTimeout(resolve, time));
//         console.log(`Processing job: ${job.id}, videoId: ${job.data.groupId}`);
//         break;
//       case 'normal-completion':
//         return await this.videoService.jobProcess(
//           'normal-completion.process.js',
//         );
//       case 'infinite-loop':
//         return await this.videoService.jobProcess('infinite-loop.process.js');
//       case 'error-occurrence':
//         return await this.videoService.jobProcess(
//           'error-occurrence.process.js',
//         );
//       case 'timeout':
//         return await this.videoService.jobProcess('timeout.process.js');
//         // const timeout = 30000;
//         // await new Promise(resolve => setTimeout(resolve, timeout));
//         break;
//       case 'error-executor':
//         throw new Error(`error-executor job.name ${job.name} job.id ${job.id}`);
//     }
//   }
// }
