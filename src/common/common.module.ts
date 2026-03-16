import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { RedisService } from './redis/redis.service';
import { RequiredHeadersPipe } from './pipes/required-headers.pipe';

@Global()
@Module({
  providers: [
    ConfigService,
    RedisService,
    RequiredHeadersPipe,
  ],
  exports: [
    ConfigService,
    RedisService,
    RequiredHeadersPipe,
  ],
})
export class CommonModule {}
