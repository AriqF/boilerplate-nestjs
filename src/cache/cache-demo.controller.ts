import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { CacheDemoService } from './cache-demo.service';

@ApiTags('cache')
@Controller('cache')
export class CacheDemoController {
  constructor(private readonly cacheDemoService: CacheDemoService) {}

  @Public()
  @Get('demo')
  @ApiOperation({ summary: 'Cache demo — cached timestamp with a 10s TTL' })
  @ResponseMessage('Cache demo')
  demo(): Promise<{ value: number; cached: boolean }> {
    return this.cacheDemoService.getOrSetTimestamp();
  }
}
