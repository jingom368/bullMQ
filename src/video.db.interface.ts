import { removeOnCompleteOption } from './video.type';

// IVideoService 인터페이스 정의
export interface IVideoDBRepository {
  setKeyValue(key: string, value: string): Promise<void>;
  changeRemoveOnCompleteOption(
    jobQueueName: string,
    jobId: string,
    removeOnComplete: removeOnCompleteOption,
  ): Promise<void>;
}
