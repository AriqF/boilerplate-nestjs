import { Queue } from 'bullmq';
import { DEMO_JOB } from './queue.constants';
import { QueueService } from './queue.service';

describe('QueueService', () => {
  it('adds a job and returns its id', async () => {
    const add = jest.fn().mockResolvedValue({ id: '42' });
    const queue = { add } as unknown as Queue;
    const service = new QueueService(queue);

    await expect(service.enqueue({ message: 'hi' })).resolves.toBe('42');
    expect(add).toHaveBeenCalledWith(DEMO_JOB, { message: 'hi' });
  });

  it('returns an empty string when the job has no id', async () => {
    const add = jest.fn().mockResolvedValue({ id: undefined });
    const service = new QueueService({ add } as unknown as Queue);

    await expect(service.enqueue({ message: 'x' })).resolves.toBe('');
  });
});
