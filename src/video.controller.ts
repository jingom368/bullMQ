// video.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { VideoService } from './video.service';
import { removeOnCompleteOption, VideoGroup } from './video.type';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  // curl -X GET "http://localhost:3000/videos/getJob?jobId=24"
  @Get('getJob')
  async getJob(@Query('jobId') jobId: string) {
    return this.videoService.getJob(jobId);
  }

  // curl -X GET "http://localhost:3000/videos/getJob?jobId=24"  @Get('getJobs')
  async getJobs(@Query('jobIds') jobIds: string[]) {
    return this.videoService.getJobs(jobIds);
  }

  // 단일 아이디 하나만 보낼 때
  // curl -X POST -H "Content-Type: application/json" -d '{"videoId": "123"}' http://localhost:3000/videos/process
  @Post('process')
  async addVideoForProcessing(@Body('videoId') videoId: string) {
    await this.videoService.addVideoForProcessing(videoId);
    return {
      message: 'Video processing started',
    };
  }

  // 단일 아이디 하나만 보낼 때 - 완료하면 10초 후 삭제
  // curl -X POST -H "Content-Type: application/json" -d '{"videoId": "123"}' http://localhost:3000/videos/process-complete
  // https://github.com/taskforcesh/bullmq/blob/7fdd8924d3625b6916e36d78c0f8e91956572a43/docs/gitbook/guide/queues/auto-removal-of-jobs.md?plain=1#L35
  @Post('process-complete')
  async addVideoForProcessingRemoveOnComplete(
    @Body('videoId') videoId: string,
  ) {
    await this.videoService.addVideoForProcessingRemoveOnComplete(videoId);
    return {
      message: 'Video processing started',
    };
  }

  // 단일 아이디 하나만 보낼 때 - 실패하면 10초 후 삭제
  // curl -X POST -H "Content-Type: application/json" -d '{"videoId": "123"}' http://localhost:3000/videos/process-failed
  @Post('process-failed')
  async addVideoForProcessingRemoveOnFailed(@Body('videoId') videoId: string) {
    await this.videoService.addVideoForProcessingRemoveOnFailed(videoId);
    return {
      message: 'Video processing started',
    };
  }

  // 단일 아이디 하나만 보낼 때 - 실패하면 10초 후 삭제
  // curl -X POST -H "Content-Type: application/json" -d '{"videoId": "123"}' http://localhost:3000/videos/process-timeout
  @Post('process-timeout')
  async addVideoForProcessingTimeout(@Body('videoId') videoId: string) {
    await this.videoService.addVideoForProcessingTimeout(videoId);
    return {
      message: 'Video processing started',
    };
  }

  // 단일 아이디와 작업 아이디 보낼 때
  // curl -X POST -H "Content-Type: application/json" -d '{"videoId": "123", "jobName": "normal-completion"}' http://localhost:3000/videos/process-job
  @Post('process-job')
  async addVideoForProcessingJob(
    @Body('videoId') videoId: string,
    @Body('jobName') jobName: string,
  ) {
    await this.videoService.addVideoForProcessingJob(videoId, jobName);
    return {
      message: 'Video processing started',
    };
  }

  // 단일 아이디와 작업 아이디와 그룹 아이디 보낼 때
  // curl -X POST -H "Content-Type: application/json" -d '{"videoId": "123", "groupId": "group1", "jobName": "normal-completion"}' http://localhost:3000/videos/process-job-group
  @Post('process-job-group')
  async addVideoForProcessingJobGroup(
    @Body('videoId') videoId: string,
    @Body('groupId') groupId: string,
    @Body('jobName') jobName: string,
  ) {
    await this.videoService.addVideoForProcessingJobGroup(
      videoId,
      groupId,
      jobName,
    );
    return {
      message: 'Video processing started',
    };
  }

  // 단일 배열 하나만 보낼 때
  // curl -X POST -H "Content-Type: application/json" -d '{"videoIds": ["123", "456"], "groupId": "group1"}' http://localhost:3000/videos/process-group
  @Post('process-group')
  async addVideosForProcessing(
    @Body('videoIds') videoIds: string[],
    @Body('groupId') groupId: string,
  ) {
    await this.videoService.addVideosForProcessing(videoIds, groupId);
    return {
      message: 'Video processing for group started',
    };
  }

  // 여러 개의 객체 묶어서 한 번에 보낼 때
  // curl -X POST -H "Content-Type: application/json" -d '{"videoIds": ["123", "456"], "groupId": "group1"}' http://localhost:3000/videos/process-group
  @Post('process-bulk')
  async addVideosForProcessingBulk(
    @Body('videoIds') videoIds: string[],
    @Body('groupId') groupId: string,
  ) {
    await this.videoService.addVideosForProcessingBulk(videoIds, groupId);
    return {
      message: 'Video processing for group started',
    };
  }

  // 단일 배열 하나만 보낼 때
  // curl -X POST -H "Content-Type: application/json" -d '{"videoIds": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"]}' http://localhost:3000/videos/addProcessGroup
  @Post('addProcessGroup')
  async addGroupVideoForProcessing(@Body('videoIds') videoIds: string[]) {
    await this.videoService.addGroupVideoForProcessing(videoIds);
    return {
      message: 'Video processing for group started2',
    };
  }

  // 단일 배열 하나만 보낼 때 / 다시 처리 - 재시도
  // curl -X POST -H "Content-Type: application/json" -d '{"videoIds": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"]}' http://localhost:3000/videos/addReProcessGroup
  @Post('addReProcessGroup')
  async addGroupVideoForReProcessing(@Body('videoIds') videoIds: string[]) {
    await this.videoService.addGroupVideoForReProcessing(videoIds);
    return {
      message: 'Video processing for group started2',
    };
  }

  // 여러 배열 한 번에 보낼 때
  // curl -X POST -H "Content-Type: application/json" -d '{"videoGroups": [{"groupId": "group1", "videoIds": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}, {"groupId": "group2", "videoIds": ["11", "12", "13", "14", "15", "16", "17", "18", "19", "20"]}, {"groupId": "group3", "videoIds": ["21", "22", "23", "24", "25", "26", "27", "28", "29", "30"]}]}' http://localhost:3000/videos/addProcessGroups
  @Post('addProcessGroups')
  async addGroupsVideoForProcessing(
    @Body('videoGroups') videoGroups: VideoGroup[],
  ) {
    await this.videoService.addGroupsVideoForProcessing(videoGroups);
    return {
      message: 'Video processing for group started2',
    };
  }

  // 여러 배열 한 번에 보낼 때 / 다시 처리 - 재시도
  // curl -X POST -H "Content-Type: application/json" -d '{"videoGroups": [{"groupId": "group1", "videoIds": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}, {"groupId": "group2", "videoIds": ["11", "12", "13", "14", "15", "16", "17", "18", "19", "20"]}, {"groupId": "group3", "videoIds": ["21", "22", "23", "24", "25", "26", "27", "28", "29", "30"]}]}' http://localhost:3000/videos/addReProcessGroups
  @Post('addReProcessGroups')
  async addGroupsVideoForReProcessing(
    @Body('videoGroups') videoGroups: VideoGroup[],
  ) {
    await this.videoService.addGroupsVideoForReProcessing(videoGroups);
    return {
      message: 'Video processing for group started2',
    };
  }

  // 여러 배열 한 번에 보낼 때 / 우선순위
  // curl -X POST -H "Content-Type: application/json" -d '{"videoGroups": [{"groupId": "group1", "videoIds": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}, {"groupId": "group2", "videoIds": ["11", "12", "13", "14", "15", "16", "17", "18", "19", "20"]}, {"groupId": "group3", "videoIds": ["21", "22", "23", "24", "25", "26", "27", "28", "29", "30"]}]}' http://localhost:3000/videos/addProcessGroupsPriority
  @Post('addProcessGroupsPriority')
  async addGroupsVideoForProcessingPriority(
    @Body('videoGroups') videoGroups: VideoGroup[],
  ) {
    await this.videoService.addGroupsVideoForReProcessingPriority(videoGroups);
    return {
      message: 'Video processing for group started2',
    };
  }

  // 그룹 아이디로 전체 작업 수를 확인
  // curl -G -H "Content-Type: application/json" --data-urlencode "groupId=group1" http://localhost:3000/videos/check-group-completion
  @Get('check-group-completion')
  async checkGroupCompletion(@Query('groupId') groupId: string) {
    const totalJobs = await this.videoService.getTotalJobsForGroup(groupId);
    const completedJobs =
      await this.videoService.getCompletedJobsForGroup(groupId);

    const isCompleted = totalJobs === completedJobs;
    return {
      groupId,
      isCompleted,
      totalJobs,
      completedJobs,
      message: isCompleted
        ? 'All jobs in the group have been completed.'
        : 'Some jobs are still processing.',
    };
  }

  @Get('waiting-all')
  async getJobAll() {
    return this.videoService.getAllWaitingJobs();
  }

  @Get('waiting-children')
  async getJobChildren() {
    return this.videoService.getAllWaitingChildrenJobs();
  }

  @Get('setRedis')
  async setRedisServer(key: string, value: string) {
    return this.videoService.setRedisServer(key, value);
  }

  @Post('changeRemoveOnCompleteOption')
  async changeRemoveOnCompleteOption(
    @Body('jobQueueName') jobQueueName: string,
    @Body('jobId') jobId: string,
    @Body('removeOnComplete') removeOnComplete: removeOnCompleteOption,
  ) {
    return this.videoService.changeRemoveOnCompleteOption(
      jobQueueName,
      jobId,
      removeOnComplete,
    );
  }

  @Get('job-process')
  async jobProcess(file: string) {
    this.videoService.jobProcess(file);
  }

  @Get('health-check')
  async healthCheck() {
    this.videoService.healthCheck();
  }

  @Get('kill-Process')
  async killProcess() {
    this.videoService.killProcess();
  }

  @Post('retry-failed-jobs')
  async retryFailedJobsWithSpecificError(@Body('errorMsg') errorMsg: string) {
    await this.videoService.retryFailedJobsWithSpecificError(errorMsg);
    return {
      message: 'Retry failed jobs with specific error',
    };
  }
}
