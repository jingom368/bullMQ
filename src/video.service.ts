import { Injectable } from '@nestjs/common';
import { VideoQueueRepository } from './video.queue.repository';
import { IVideoService } from './video.service.interface';
import { removeOnCompleteOption, VideoGroup } from './video.type';
import { VideoDBRepository } from './video.db.repository';
import { JobProcessor } from './job.processor';

@Injectable()
export class VideoService implements IVideoService {
  constructor(
    private readonly videoQueueRepository: VideoQueueRepository,
    private readonly videoDBRepository: VideoDBRepository,
    private readonly jobProcessor: JobProcessor,
  ) {
    console.log('VideoService initialized');
  }
  async getJob(jobId: string): Promise<void> {
    await this.videoQueueRepository.getJob(jobId);
  }

  async getJobs(jobIds: string[]): Promise<void> {
    await this.videoQueueRepository.getJobs(jobIds);
  }

  async addVideoForProcessing(videoId: string) {
    console.log(`Adding video for processing: ${videoId}`);
    await this.videoQueueRepository.addVideoForProcessing(videoId);
  }

  async addVideoForProcessingRemoveOnComplete(videoId: string): Promise<void> {
    await this.videoQueueRepository.addVideoForProcessingRemoveOnComplete(
      videoId,
    );
  }

  async addVideoForProcessingRemoveOnFailed(videoId: string): Promise<void> {
    await this.videoQueueRepository.addVideoForProcessingRemoveOnFailed(
      videoId,
    );
  }

  async addVideoForProcessingTimeout(videoId: string): Promise<void> {
    await this.videoQueueRepository.addVideoForProcessingTimeout(videoId);
  }

  async addVideoForProcessingJob(
    videoId: string,
    jobName: string,
  ): Promise<void> {
    await this.videoQueueRepository.addVideoForProcessingJob(videoId, jobName);
  }

  async addVideoForProcessingJobGroup(
    videoId: string,
    groupId: string,
    jobName: string,
  ): Promise<void> {
    await this.videoQueueRepository.addVideoForProcessingJobGroup(
      videoId,
      groupId,
      jobName,
    );
  }

  async addVideosForProcessing(videoIds: string[], groupId: string) {
    await this.videoQueueRepository.addVideosForProcessing(videoIds, groupId);
    console.log(
      `Adding ${videoIds.length} videos for processing in group: ${groupId}`,
    );
  }

  async addVideosForProcessingBulk(videoIds: string[], groupId: string) {
    await this.videoQueueRepository.addVideosForProcessingBulk(
      videoIds,
      groupId,
    );
    console.log(
      `Adding ${videoIds.length} videos for processing in group: ${groupId}`,
    );
  }

  async getTotalJobsForGroup(groupId: string): Promise<number> {
    return await this.videoQueueRepository.getTotalJobsForGroup(groupId);
  }

  async getCompletedJobsForGroup(groupId: string): Promise<number> {
    return await this.videoQueueRepository.getCompletedJobsForGroup(groupId);
  }

  async addGroupVideoForProcessing(videoIds: string[]) {
    this.videoQueueRepository.addGroupVideoForProcessing(videoIds);
  }

  async addGroupVideoForReProcessing(videoIds: string[]) {
    this.videoQueueRepository.addGroupVideoForReProcessing(videoIds);
  }

  async addGroupsVideoForProcessing(videoGroups: VideoGroup[]) {
    this.videoQueueRepository.addGroupsVideoForProcessing(videoGroups);
  }

  async addGroupsVideoForReProcessing(videoGroups: VideoGroup[]) {
    this.videoQueueRepository.addGroupsVideoForReProcessing(videoGroups);
  }

  async addGroupsVideoForReProcessingPriority(videoGroups: VideoGroup[]) {
    this.videoQueueRepository.addGroupsVideoForProcessingPriority(videoGroups);
  }

  async getAllWaitingJobs() {
    return this.videoQueueRepository.getAllWaitingJobs();
  }

  async getAllWaitingChildrenJobs() {
    return this.videoQueueRepository.getAllWaitingChildrenJobs();
  }

  async setRedisServer(key: string, value: string) {
    await this.videoDBRepository.setKeyValue(key, value);
  }

  async changeRemoveOnCompleteOption(
    jobQueueName: string,
    jobId: string,
    removeOnComplete: removeOnCompleteOption,
  ) {
    await this.videoDBRepository.changeRemoveOnCompleteOption(
      jobQueueName,
      jobId,
      removeOnComplete,
    );
  }

  async jobProcess(file: string): Promise<void> {
    return this.jobProcessor.process(file);
  }

  async healthCheck(): Promise<void> {
    this.jobProcessor.getHealthCheck();
  }

  async killProcess(): Promise<void> {
    this.jobProcessor.killProcess();
  }

  async retryFailedJobsWithSpecificError(errorMsg: string): Promise<void> {
    await this.videoQueueRepository.retryFailedJobsWithSpecificError(errorMsg);
  }
}
