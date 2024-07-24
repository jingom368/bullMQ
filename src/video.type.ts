export interface VideoGroup {
  groupId: string;
  videoIds: string[];
}

export interface removeOnCompleteOption {
  removeOnComplete: boolean | string | KeepJobs;
}

interface KeepJobs {
  /**
   * Maximum age in seconds for job to be kept.
   */
  age?: number;
  /**
   * Maximum count of jobs to be kept.
   */
  count?: number;
}
