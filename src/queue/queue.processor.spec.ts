import { Job } from 'bullmq';
import { DemoProcessor } from './queue.processor';

describe('DemoProcessor', () => {
  it('processes a job and echoes the message', async () => {
    const processor = new DemoProcessor();
    const job = { id: '1', data: { message: 'ping' } } as Job<{
      message: string;
    }>;

    await expect(processor.process(job)).resolves.toEqual({
      processed: true,
      echo: 'ping',
    });
  });
});
