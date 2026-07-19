import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiSecuredEndpoint } from './common/decorators/api-secured.decorator';
import { Public } from './common/decorators/public.decorator';
import { ResponseMessage } from './common/decorators/response-message.decorator';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Public health/root check — opted out of the global ApiKeyGuard. */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Public root endpoint' })
  getHello(): string {
    return this.appService.getHello();
  }

  /** Demo of a protected endpoint (requires x-api-key + x-timestamp). */
  @Get('secure')
  @ApiSecuredEndpoint()
  @ApiOperation({ summary: 'Protected demo endpoint' })
  @ResponseMessage('Authorized')
  getSecure(): { message: string } {
    return { message: 'You are authorized' };
  }
}
