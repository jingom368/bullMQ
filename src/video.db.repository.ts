import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { IVideoDBRepository } from './video.db.interface';
import { removeOnCompleteOption } from './video.type';

@Injectable()
export class VideoDBRepository implements IVideoDBRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setKeyValue(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }

  async changeRemoveOnCompleteOption(
    jobQueueName: string,
    jobId: string,
    removeOnComplete: removeOnCompleteOption,
  ): Promise<void> {
    console.log('removeOnComplete', removeOnComplete);

    // 작업 옵션 키 구성 (예: bull:jobQueue:7:opts)
    const jobOptsKey = `bull:${jobQueueName}:${jobId}:opts`;

    // 새로운 opts 객체 구성
    const newOpts = {
      removeOnComplete: removeOnComplete,
    };

    // opts 객체를 JSON 문자열로 직렬화
    const optsValue = JSON.stringify(newOpts);

    // removeOnComplete 옵션이 객체인 경우, JSON 문자열로 직렬화
    // 그렇지 않은 경우, toString()을 사용하여 문자열로 변환
    const removeOnCompleteValue =
      typeof removeOnComplete === 'object'
        ? JSON.stringify(removeOnComplete)
        : removeOnComplete;

    console.log('removeOnCompleteValue:', removeOnCompleteValue);

    // removeOnComplete 옵션 변경
    await this.redis.hset(jobOptsKey, 'opts', removeOnCompleteValue);

    console.log('newOpts:', newOpts);
    console.log('optsValue:', optsValue);

    // opts 필드에 새로운 객체 저장
    await this.redis.hset(jobOptsKey, 'opts', removeOnCompleteValue);

    // 변경 사항 확인을 위한 로깅 (선택적)
    const updatedOpts = await this.redis.hgetall(jobOptsKey);
    console.log(`Updated options for job ${jobId}:`, updatedOpts);
  }
}
