// error-occurrence.process.ts
export async function errorOccurrence(): Promise<void> {
  return new Promise((_, reject) => {
    reject(new Error('An error has occurred.'));
  });
}

(async () => {
  try {
    await errorOccurrence();
  } catch (error) {
    if (process.send) {
      console.log('Sending error message to parent process'); // 디버깅 로그 추가
      process.send({ status: 'error', error: error.message });
    }
    process.exit(1); // 에러 발생 시 종료 코드 1
  }
})();
