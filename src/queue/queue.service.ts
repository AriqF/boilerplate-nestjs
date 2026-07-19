import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { DEMO_JOB, DEMO_QUEUE, DemoJobData } from './queue.constants';

/** Producer: enqueues jobs onto the demo queue. */
@Injectable()
export class QueueService {
  constructor(@InjectQueue(DEMO_QUEUE) private readonly queue: Queue) {}

  async enqueue(data: DemoJobData): Promise<string> {
    const job = await this.queue.add(DEMO_JOB, data);
    return job.id ?? '';
  }
}
