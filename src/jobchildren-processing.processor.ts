// import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'; // Adjusted import
// import { Job } from 'bullmq';
import {
  Processor,
  WorkerHost,
  OnWorkerEvent,
} from '@taskforcesh/nestjs-bullmq-pro';
import { JobPro } from '@taskforcesh/bullmq-pro';

@Processor('jobChildrenQueue', { concurrency: 20 })
export class jobChildrenProcessingProcessor extends WorkerHost {
  constructor() {
    super();
  }

  private jobHandlers = {
    'one-group-test': async (job: JobPro) => {
      const time = Math.random() * 5000;
      console.log(
        `process jobID: ${job.id}, jobData: ${job.data}, jobName: ${job.name}, time: ${time}, priority: ${job.opts?.priority}`,
      );
      // 오류에 따라서 타임아웃 : 재시도, 아닐 경우 : 실패
      // 실패처리로 바꿀 수 있는 지 확인을 해야 함.
      // 그룹은 fail 1~9까지는 성공 10번은 실패로 남을 수 있는 지 확인.
      await new Promise(resolve => setTimeout(resolve, time));
    },
    'bulk-test': async (job: JobPro) => {
      const time = Math.random() * 5000;
      console.log(
        `process jobID: ${job.id}, jobData: ${job.data}, jobName: ${job.name}, time: ${time}`,
      );
      // 오류에 따라서 타임아웃 : 재시도, 아닐 경우 : 실패
      // 실패처리로 바꿀 수 있는 지 확인을 해야 함.
      // 그룹은 fail 1~9까지는 성공 10번은 실패로 남을 수 있는 지 확인.
      await new Promise(resolve => setTimeout(resolve, time));
    },
    'many-group-test': async (job: JobPro) => {
      let time = Math.random() * 5000;
      if (job.name === '10') {
        time += 10000; // 기존 시간에 10초(10000ms)를 추가합니다.
      }
      console.log(
        `process jobID: ${job.id}, jobDataChildrenId: ${job.data.videoId}, jobGroupId: ${job.data.groupId}, jobName: ${job.name}, time: ${time}, priority: ${job.opts?.priority}`,
      );
      await new Promise(resolve => setTimeout(resolve, time));
    },
    'one-group-test-error': async (job: JobPro) => {
      const time = Math.random() * 5000;
      console.log(
        `process jobID: ${job.id}, jobData: ${job.data}, jobName: ${job.name}, time: ${time}`,
      );
      // 오류에 따라서 타임아웃 : 재시도, 아닐 경우 : 실패
      // 실패처리로 바꿀 수 있는 지 확인을 해야 함.
      // 그룹은 fail 1~9까지는 성공 10번은 실패로 남을 수 있는 지 확인.
      await new Promise(resolve => setTimeout(resolve, time));
      throw new Error('Error occurred');
    },
    // 재시도 할 수 있어야 한다.
    'many-group-test-error': async (job: JobPro) => {
      const time = Math.random() * 5000;
      // if (job.name === '10') {
      //   time += 10000; // 기존 시간에 10초(10000ms)를 추가합니다.
      // }
      console.log(
        `process jobID: ${job.id}, jobDataChildrenId: ${job.data.videoId}, jobGroupId: ${job.data.groupId}, jobName: ${job.name}, time: ${time}`,
      );
      await new Promise(resolve => setTimeout(resolve, time));
      throw new Error('Error occurred');
    },
  };

  // Adjusted method signature to match the expected signature from WorkerHost
  async process(job: JobPro): Promise<any> {
    const handler = this.jobHandlers[job.data.name];
    if (handler) {
      await handler(job);
    } else {
      throw new Error(`Unhandled job type: ${job.data.name}`);
    }
    // throw new Error(`Process Error Occurred ${job.data.name}`);
  }

  @OnWorkerEvent('failed')
  onEvent(job: JobPro, event: string) {
    const jobType = job.data.name;
    const handler = this.eventHandlers[jobType]?.failed;
    if (handler) {
      handler(job, event);
    } else {
      console.log(
        `[Unknown Type] Failed job ${job.id} of type ${job.name}: ${event}`,
      );
    }
  }

  @OnWorkerEvent('active')
  onEventActive(job: JobPro, event: string) {
    const jobType = job.data.name;
    const handler = this.eventHandlers[jobType]?.active;
    if (handler) {
      handler(job, event);
    } else {
      console.log(
        `[Unknown Type] Active job ${job.id}, ${job.data.videoId} of ${job.data.groupId}: ${event}`,
      );
    }
  }

  private eventHandlers = {
    'one-group-test': {
      failed: (job: JobPro, event: string) => {
        console.log(
          `[One-Group-Test] Failed job ${job.id} of type ${job.name}: ${event}`,
        );
      },
      active: (job: JobPro, event: string) => {
        console.log(
          `[One-Group-Test] Active job ${job.id} of type ${job.name}: ${event}`,
        );
      },
    },
    'many-group-test': {
      failed: (job: JobPro, event: string) => {
        console.log(
          `[Many-Group-Test] Failed job ${job.id}, ${job.data.videoId} of ${job.data.groupId}: ${event}`,
        );
      },
      active: (job: JobPro, event: string) => {
        console.log(
          `[Many-Group-Test] Active job ${job.id}, ${job.data.videoId} of ${job.data.groupId}: ${event}`,
        );
      },
    },
  };
}
