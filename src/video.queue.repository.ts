// video.repository.ts
import { Injectable } from '@nestjs/common';
// import { InjectQueue, InjectFlowProducer } from '@nestjs/bullmq';
// import { Queue, FlowProducer } from 'bullmq';
import { QueuePro, FlowProducerPro } from '@taskforcesh/bullmq-pro';
import {
  InjectQueue,
  InjectFlowProducer,
} from '@taskforcesh/nestjs-bullmq-pro';
// import { InjectRedis } from '@liaoliaots/nestjs-redis';
// import Redis from 'ioredis';
import { IVideoQueueRepository } from './video.queue.repository.interface';
import { VideoGroup } from './video.type';
import { JobType } from './job.Type';

@Injectable()
export class VideoQueueRepository implements IVideoQueueRepository {
  constructor(
    @InjectQueue('jobQueue') private videoQueue: QueuePro,
    @InjectFlowProducer('flowProducerName')
    private flowProducer: FlowProducerPro,
  ) {}

  async getJob(jobId): Promise<void> {
    const job = await this.videoQueue.getJob(jobId);
    console.log('jobId', jobId);
    console.log('job', job);
  }

  async getJobs(jobIds: string[]): Promise<void> {
    const states: JobType[] = [
      'active',
      'waiting',
      'completed',
      'failed',
      'delayed',
      'paused',
    ];
    const jobs = await Promise.all(
      states.map(state => this.videoQueue.getJobs(state)),
    );
    console.log('jobIds', jobIds);
    console.log('jobs', jobs);
  }

  async addVideoForProcessing(videoId: string): Promise<void> {
    await this.videoQueue.add('transcode', { videoId });
  }

  async addVideoForProcessingRemoveOnComplete(videoId: string): Promise<void> {
    await this.videoQueue.add(
      'transcode',
      { videoId },
      {
        removeOnComplete: { age: 3600 }, // 작업 완료 후 즉시 삭제
      },
    );
  }

  async addVideoForProcessingRemoveOnFailed(videoId: string): Promise<void> {
    await this.videoQueue.add(
      'transcode',
      { videoId },
      {
        removeOnFail: { age: 3600 }, // 작업 완료 후 10초 후에 삭제
      },
    );
  }

  async addVideoForProcessingTimeout(videoId: string): Promise<void> {
    await this.videoQueue.add('timeout', { videoId });
  }

  async addVideoForProcessingJob(
    videoId: string,
    jobName: string,
  ): Promise<void> {
    await this.videoQueue.add(
      `${jobName}`,
      { videoId },
      // {
      //   attempts: 2,
      //   backoff: {
      //     type: 'exponential',
      //     delay: 1000,
      //   },
      // },
    );
  }

  async addVideoForProcessingJobGroup(
    videoId: string,
    groupId: string,
    jobName: string,
  ): Promise<void> {
    await this.videoQueue.add(`${jobName}`, { videoId });
  }

  async addVideoForReProcessing(videoId: string): Promise<void> {
    await this.videoQueue.add(
      'transcode',
      { videoId },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }

  async addVideosForProcessing(
    videoIds: string[],
    groupId: string,
  ): Promise<void> {
    for (const videoId of videoIds) {
      await this.videoQueue.add(
        'transcode',
        { videoId },
        { jobId: `${groupId}-${videoId}` },
      );
    }
  }

  async addVideosForProcessingBulk(
    videoIds: string[],
    groupId: string,
  ): Promise<void> {
    const jobs = videoIds.map((videoId, index) => ({
      name: `transcode`,
      queueName: `jobQueue`,
      data: { idx: 0, groupId: groupId },
      children: [
        {
          name: `${index + 1}`,
          data: { videoId: videoId, groupId: groupId, name: 'bulk-test' },
          queueName: `jobChildrenQueue`,
        },
      ],
    }));
    await this.flowProducer.addBulk(jobs);
  }

  async getTotalJobsForGroup(groupId: string): Promise<number> {
    const jobs = await this.videoQueue.getJobs([
      'waiting',
      'waiting-children',
      'active',
      'completed',
      'failed',
      'delayed',
    ]);
    return jobs.filter(job => job.id.toString().startsWith(groupId)).length;
  }

  async getCompletedJobsForGroup(groupId: string): Promise<number> {
    const jobs = await this.videoQueue.getCompleted();
    console.log('completed Jobs', jobs.length);
    return jobs.filter(job => job.id.toString().startsWith(groupId)).length;
  }

  async addGroupVideoForProcessing(videoIds: string[]): Promise<void> {
    await this.flowProducer.add({
      name: 'transcode',
      queueName: 'jobQueue',
      data: { idx: 0, groupId: 'group' },
      children: videoIds.map((videoId, index) => ({
        name: `${index + 1}`,
        data: { videoId: videoId, name: 'one-group-test' },
        queueName: 'jobChildrenQueue',
      })),
    });
  }

  async addGroupVideoForReProcessing(videoIds: string[]): Promise<void> {
    await this.flowProducer.add({
      name: 'transcode',
      queueName: 'jobQueue',
      data: { idx: 0, groupId: 'group' },
      children: videoIds.map((videoId, index) => ({
        name: `${index + 1}`,
        data: { videoId: videoId, name: 'one-group-test-error' },
        opts: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000, // 1초 지연을 기본값으로 사용
          },
        },
        queueName: 'jobChildrenQueue',
      })),
    });
  }

  async addGroupsVideoForProcessing(videoGroups: VideoGroup[]): Promise<void> {
    for (const { groupId, videoIds } of videoGroups) {
      await this.flowProducer.add({
        name: 'transcode',
        queueName: 'jobQueue',
        data: { idx: 0, groupId: groupId },
        children: videoIds.map((videoId, index) => ({
          name: `${index + 1}`,
          data: { videoId: videoId, groupId: groupId, name: 'many-group-test' },
          queueName: 'jobChildrenQueue',
        })),
      });
    }
  }

  async addGroupsVideoForReProcessing(
    videoGroups: VideoGroup[],
  ): Promise<void> {
    for (const { groupId, videoIds } of videoGroups) {
      await this.flowProducer.add({
        name: 'transcode',
        queueName: 'jobQueue',
        data: { idx: 0, groupId: groupId },
        children: videoIds.map((videoId, index) => ({
          name: `${index + 1}`,
          data: {
            videoId: videoId,
            groupId: groupId,
            name: 'many-group-test-error',
          },
          opts: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000, // 1초 지연을 기본값으로 사용
            },
          },
          queueName: 'jobChildrenQueue',
        })),
      });
    }
  }

  async addGroupsVideoForProcessingPriority(
    videoGroups: VideoGroup[],
  ): Promise<void> {
    for (const { groupId, videoIds } of videoGroups) {
      await this.flowProducer.add({
        name: 'transcode',
        queueName: 'jobQueue',
        data: { idx: 0, groupId: groupId },
        children: videoIds.map((videoId, index) => ({
          name: `${index + 1}`,
          data: {
            videoId: videoId,
            groupId: groupId,
            name: 'many-group-test',
            priority: videoIds.length - index,
          },
          opts: {
            priority: videoIds.length - index,
          },
          queueName: 'jobChildrenQueue',
        })),
      });
    }
  }

  async getAllWaitingJobs(): Promise<any[]> {
    const waitingJobs = await this.videoQueue.getWaiting();
    return waitingJobs.map(job => ({
      id: job.id,
      name: job.name,
      data: job.data,
      status: 'waiting',
    }));
  }

  async getAllWaitingChildrenJobs(): Promise<any[]> {
    const waitingJobs = await this.videoQueue.getWaitingChildren();
    console.log('waitingJobs:', waitingJobs);
    return waitingJobs;
  }

  async retryFailedJobsWithSpecificError(errorMsg: string): Promise<void> {
    const failedJobs = await this.videoQueue.getFailed();
    console.log('failedJobs', failedJobs);
    const jobsToRetry = failedJobs.filter(job =>
      job.stacktrace[0].includes(errorMsg),
    );
    console.log('job.failedReason', failedJobs[0].failedReason);
    console.log('jobsToRetry', jobsToRetry);
    console.log('jobsToRetry.length', jobsToRetry.length);

    // 각 작업 재시도
    for (const job of jobsToRetry) {
      try {
        // 작업 재시도
        await job.retry();
        console.log(`Job ${job.id} has been retried.`);
      } catch (error) {
        console.error(`Failed to retry job ${job.id}:`, error);
      }
    }
  }
}
