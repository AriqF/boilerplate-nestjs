import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { EnqueueJobDto } from './dto/enqueue-job.dto';
import { QueueService } from './queue.service';

@ApiTags('queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Public()
  @Post('jobs')
  @ApiOperation({ summary: 'Enqueue a demo job' })
  @ResponseMessage('Job enqueued')
  async enqueue(@Body() dto: EnqueueJobDto): Promise<{ jobId: string }> {
    const jobId = await this.queueService.enqueue(dto);
    return { jobId };
  }
}
