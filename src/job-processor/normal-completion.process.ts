// normal-completion.process.ts
export async function normalCompletion(): Promise<string> {
  return 'Process completed successfully.';
}

(async () => {
  const result = await normalCompletion();
  if (process.send) {
    console.log('Sending completion message to parent process'); // 디버깅 로그 추가
    process.send({ status: 'completed', result });
  }
  process.exit(0);
})();
