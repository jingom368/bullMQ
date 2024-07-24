import { removeOnCompleteOption, VideoGroup } from './video.type';

// IVideoService 인터페이스 정의
export interface IVideoService {
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
  addGroupsVideoForReProcessingPriority(
    videoGroups: VideoGroup[],
  ): Promise<void>;
  getAllWaitingJobs(): Promise<any>; // 반환 타입을 명확히 해야 할 수 있습니다.
  getAllWaitingChildrenJobs(): Promise<any>; // 반환 타입을 명확히 해야 할 수 있습니다.
  setRedisServer(key: string, value: string): Promise<void>;
  changeRemoveOnCompleteOption(
    jobQueueName: string,
    jobId: string,
    removeOnComplete: removeOnCompleteOption,
  ): Promise<void>;
  jobProcess(file: string): Promise<void>;
  healthCheck(): Promise<void>;
  killProcess(): Promise<void>;
  retryFailedJobsWithSpecificError(errorMsg: string): Promise<void>;
}
