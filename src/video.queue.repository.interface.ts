import { VideoGroup } from './video.type';

// video.repository.interface.ts
export interface IVideoQueueRepository {
  getJob(jobId: string): Promise<void>;
  getJobs(jobIds: string[]): Promise<void>;
  addVideoForProcessing(videoId: string): Promise<void>;
  addVideoForProcessingRemoveOnComplete(videoId: string): Promise<void>;
  addVideoForProcessingRemoveOnFailed(videoId: string): Promise<void>;
  addVideoForProcessingTimeout(videoId: string): Promise<void>;
  addVideoForProcessingJob(videoId: string, jobName: string): Promise<void>;
  addVideoForProcessingJobGroup(
    videoId: string,
    groupId: string,
    jobName: string,
  ): Promise<void>;
  addVideosForProcessing(videoIds: string[], groupId: string): Promise<void>;
  addVideosForProcessingBulk(
    videoIds: string[],
    groupId: string,
  ): Promise<void>;
  getTotalJobsForGroup(groupId: string): Promise<number>;
  getCompletedJobsForGroup(groupId: string): Promise<number>;
  addGroupVideoForProcessing(videoIds: string[]): Promise<void>;
  addGroupVideoForReProcessing(videoIds: string[]): Promise<void>;
  addGroupsVideoForProcessing(videoGroups: VideoGroup[]): Promise<void>;
  addGroupsVideoForReProcessing(videoGroups: VideoGroup[]): Promise<void>;
  addGroupsVideoForProcessingPriority(videoGroups: VideoGroup[]): Promise<void>;
  getAllWaitingJobs(): Promise<any[]>;
  getAllWaitingChildrenJobs(): Promise<any[]>;
  retryFailedJobsWithSpecificError(errorMsg: string): Promise<void>;
}
