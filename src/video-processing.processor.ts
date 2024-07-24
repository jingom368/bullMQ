// import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'; // Adjusted import
// import { Job } from 'bullmq';
import {
  Processor,
  WorkerHost,
  OnWorkerEvent,
} from '@taskforcesh/nestjs-bullmq-pro';
import { DelayedError, JobPro } from '@taskforcesh/bullmq-pro';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { VideoService } from './video.service';
import { Observable, of, tap } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Processor('jobQueue', {
  concurrency: 5,
  ttl: { timeout: 5000 },
  group: {
    concurrency: 3,
  },
})
export class VideoProcessingProcessor extends WorkerHost {
  constructor(
    @InjectRedis() private readonly redis: Redis, // 'REDIS' 이름으로 Redis 클라이언트 주입
    private readonly videoService: VideoService,
  ) {
    super();
  }

  // Adjusted method signature to match the expected signature from WorkerHost
  async process(job: JobPro): Promise<any> {
    console.log('jobname', job.name);
    let jobProcessPromise;
    switch (job.name) {
      case 'transcode':
        const time = 10000;
        await new Promise(resolve => setTimeout(resolve, time));
        console.log(`Processing job: ${job.id}, videoId: ${job.data.groupId}`);

      case 'normal-completion':
        jobProcessPromise = this.videoService.jobProcess(
          'normal-completion.process.js',
        );
        break;
      case 'infinite-loop':
        jobProcessPromise = this.videoService.jobProcess(
          'infinite-loop.process.js',
        );
        break;
      case 'error-occurrence':
        jobProcessPromise = this.videoService.jobProcess(
          'error-occurrence.process.js',
        );
        break;
      case 'timeout':
        jobProcessPromise = this.videoService.jobProcess('timeout.process.js');
        // const timeout = 20000;
        // await new Promise(resolve => setTimeout(resolve, timeout));
        break;
      case 'error-executor':
        throw new Error(`error-executor job.name ${job.name} job.id ${job.id}`);
      // default:
      //   throw new Error(
      //     `job attempted: ${job.attemptsMade} Unhandled job type: ${job.name}`,
      //   );
    }

    await jobProcessPromise;

    // const rejectPromise = new Promise((resolve, reject) => {
    //   setTimeout(() => reject(new Error('특정 에러 메시지')), 2000); // 100ms 후에 특정 에러 메시지와 함께 거부
    // });

    // try {
    //   // Promise.race()를 사용하여 가장 먼저 완료되는 작업 처리
    //   const result = await Promise.race([jobProcessPromise, rejectPromise]);
    //   console.log(result); // 가장 먼저 완료된 작업의 결과 로깅
    // } catch (error) {
    //   console.error(error); // 에러 로깅
    //   throw error; // 여기에서 에러를 던져 프로세스를 중단시킴
    // }
    // console.log('hello');

    // // Observable을 사용하여 비동기 작업 수행
    // const observable = new Observable<number>(subscriber => {
    //   setTimeout(async () => {
    //     await jobProcessPromise;
    //     subscriber.next(4);
    //     subscriber.complete();
    //   }, 0); // 100초 후에 next와 complete 호출

    //   // 구독 취소 시 리소스 정리
    //   return function unsubscribe() {
    //     console.log('구독 취소');
    //   };
    // }).pipe(
    //   timeout({
    //     each: 5000,
    //     with: () =>
    //       of(null).pipe(
    //         tap(async () => {
    //           try {
    //             // 잠금 시간 연장
    //             console.log('job.token', job.token);
    //             // job.moveToFailed(
    //             //   new Error('지정된 시간이 지났습니다. 잡을 실패처리 합니다.'),
    //             //   job.token,
    //             // );
    //             throw new Error('Error 발생');
    //           } catch (error) {
    //             console.error('잠금 연장 실패:', error);
    //             // 잠금 연장 실패 시 작업 실패로 이동
    //           }
    //         }),
    //       ),
    //   }),
    // );

    // // Observable 구독
    // await new Promise((resolve, reject) => {
    //   observable.subscribe({
    //     next: value => console.log(value),
    //     error: err => {
    //       console.error(err);
    //       reject(err); // 에러 발생 시 Promise를 reject
    //     },
    //     complete: () => {
    //       console.log('Completed');
    //       resolve(null); // 완료 시 Promise를 resolve
    //     },
    //   });
    // });

    // // await new Promise(resolve => setTimeout(resolve, 100000));
    // console.log('hello');
  }

  // @OnWorkerEvent('failed')
  // onEvent(job: JobPro, event: string) {
  //   console.log(
  //     `[Unknown Type] Failed job ${job.id} of type ${job.name}: ${event}`,
  //   );
  // }

  // @OnWorkerEvent('active')
  // async onEventActive(job: JobPro, event: string) {
  //   console.log(
  //     `[Unknown Type] Active job ${job.id}, ${job.data.videoId} of ${job.data.groupId}: ${event}`,
  //   );

  //   console.log('this.redis.options.host', this.redis.options.host);
  //   console.log('this.redis.options.port', this.redis.options.port);

  // const maxProcessingTime = 10000;

  // setTimeout(async () => {
  //   console.log(`Job ${job.id} is taking too long and will be terminated.`);
  //   const jobActive = await job.isActive;
  //   if (jobActive) {
  //     await job.moveToFailed(
  //       new Error('Job took too long to process'),
  //       job.token,
  //     );
  //   }
  // }, maxProcessingTime);
  // }
}

// 포스트맨으로 겟 헬스체크를 쐈으면 active잡을 가지고 와서 연결된 워커들을 찾아와서
// 정상적으로 동작중인지 확인.
// getJobs() => JSON active 이벤트를 가진 작업을 찾아서 그 잡을 가져간 워커를 찾아간다.
// 워커에서 정보를 찾아본다.
// timeout
