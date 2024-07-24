console.log('Zombie process started. This process will not exit on its own.');

setInterval(() => {
  console.log('Zombie process is still alive...');
}, 1000); // 10초마다 메시지를 출력합니다.

// 이 스크립트는 종료되지 않으며, 수동으로 프로세스를 종료해야 합니다.
