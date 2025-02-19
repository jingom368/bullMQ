import { Injectable } from '@nestjs/common';
import { fork, ChildProcess } from 'child_process';
import * as pidusage from 'pidusage';

interface Message {
  status: string;
  result: any;
}

@Injectable()
export class JobProcessor {
  private child: ChildProcess | null = null;
  private startTime: number | null = null;
  private timeoutId: NodeJS.Timeout | null = null;

  async process(file: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.startTime = Date.now();
      this.child = fork(`dist/job-processor/${file}`, [], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      });

      // 타임아웃 설정 (예: 20초)
      //   const timeout = 20000;
      //   this.timeoutId = setTimeout(() => {
      //   if (this.child && !this.child.killed) {
      // this.child.kill();
      // console.error(
      //   `Process with PID ${this.child.pid} has been terminated due to timeout.`,
      // );
      // reject(new Error('Process terminated due to timeout.'));
      //   }
      //   }, timeout);

      this.child.on('message', (message: Message) => {
        console.log('message', message);
        console.log('message.status', message.status);
        if (message.status === 'completed') {
          resolve(message.result);
          if (this.timeoutId) {
            clearTimeout(this.timeoutId);
          }
        }
      });

      this.child.on('exit', code => {
        if (this.startTime) {
          const endTime = Date.now();
          console.log(`Process completed in ${endTime - this.startTime} ms`);
        }
        console.log('Process exited with code:', code);
        if (code === 0) {
          resolve(`Process completed successfully.`);
        } else {
          // reject(new Error(`Process exited with code ${code}`));
        }
      });

      this.child.on('error', error => {
        console.error('Error in child process:', error);
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }
        reject(error);
      });

      return { childPid: this.child.pid };
    });
  }

  getHealthCheck = async () => {
    if (!this.child || !this.startTime) {
      console.error('Process has not been started');
      return null;
    }

    try {
      const stats = await pidusage(this.child.pid);
      console.log('cpu', stats.cpu);
      console.log('memory', stats.memory);
      console.log('elapsedTime', Date.now() - this.startTime);
      return {
        cpu: stats.cpu,
        memory: stats.memory,
        elapsedTime: Date.now() - this.startTime,
      };
    } catch (error) {
      console.error('Error getting process stats:', error);
      return null;
    }
  };

  async pingChildProcess(): Promise<boolean> {
    return new Promise(resolve => {
      if (!this.child) {
        console.error('No child process to ping.');
        return resolve(false);
      }

      // 핑 메시지 리스너 설정
      const messageListener = (message: Message) => {
        if (message.status === 'pong') {
          clearTimeout(timeoutId);
          this.child?.off('message', messageListener); // 리스너 제거
          resolve(true);
        }
      };

      // 타임아웃 설정 (예: 5초)
      const timeoutId = setTimeout(() => {
        this.child?.off('message', messageListener); // 타임아웃 시 리스너 제거
        console.error('Ping to child process timed out.');
        resolve(false);
      }, 5000);

      this.child.on('message', messageListener);

      // 핑 메시지 보내기
      this.child.send({ type: 'ping' });
    });
  }

  killProcess(): void {
    if (this.child && !this.child.killed) {
      this.child.kill();
      console.log(`Process with PID ${this.child.pid} has been terminated.`);
      this.child = null;
      this.startTime = null;
    } else {
      console.log('No active process to terminate.');
    }
  }
}

// job이 active고 10분을 초과했다면
// health체크 해보니 job active | 10분 초과 | cpu 사용량이 없을 경우 | memory가 적을 경우
// 실행기쪽의 nodejs <- 워커 자체가 문제인지. 워커가 실행한 프로세스가 문제인지
//
