import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DEMO_QUEUE, DemoJobData } from './queue.constants';

interface DemoJobResult {
  processed: boolean;
  echo: string;
}

/** Worker: processes demo-queue jobs. */
@Processor(DEMO_QUEUE)
export class DemoProcessor extends WorkerHost {
  private readonly logger = new Logger(DemoProcessor.name);

  process(job: Job<DemoJobData>): Promise<DemoJobResult> {
    this.logger.log(`Processing job ${job.id}: "${job.data.message}"`);
    return Promise.resolve({ processed: true, echo: job.data.message });
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<DemoJobData>, error: Error): void {
    this.logger.error(
      `Job ${job.id} failed (attempt ${job.attemptsMade}): ${error.message}`,
    );
  }
}
