import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  HealthIndicator,
  HealthIndicatorResult,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { RedisService } from '../common/redis/redis.service';

@ApiTags('health')
@Controller('health')
export class HealthController extends HealthIndicator {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private redis: RedisService,
  ) {
    super();
  }

  @Get('liveness')
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe to check if the app is capable of receiving traffic' })
  checkLiveness() {
    return this.health.check([]);
  }

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe to check if critical dependencies are up' })
  checkReadiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.checkRedis(),
    ]);
  }

  private async checkRedis(): Promise<HealthIndicatorResult> {
    try {
      await this.redis.ping();
      return this.getStatus('redis', true);
    } catch (e) {
      return this.getStatus('redis', false, { message: e instanceof Error ? e.message : String(e) });
    }
  }
}
