import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Run standard JWT validation first
    const isValid = await super.canActivate(context);
    if (!isValid) return false;

    // Extract raw token from Authorization header
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string } }>();
    const authHeader = request.headers.authorization ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (await this.redisService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token has been invalidated. Please log in again.');
    }

    return true;
  }
}
