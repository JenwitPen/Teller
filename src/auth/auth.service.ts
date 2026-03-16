import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { UserRepository } from '../user/user.repository';
import { LoginDto } from './dto/login.dto';
import { RedisService } from '../common/redis/redis.service';
import { ConfigService } from '../common/config/config.service';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private dataSource: DataSource,
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ access_token: string; role?: string,username?:string,employee_id?:string,branch_code?:string }> {
    const { username, password } = loginDto;
    const user = await this.userRepository.findByUsername(this.dataSource.manager, username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Single session enforcement: Check for existing session and blacklist old token
    const oldToken = await this.redisService.getUserSession(user.username);
    if (oldToken) {
      // Decode old token to get remaining TTL
      const decoded = this.jwtService.decode(oldToken) as { exp?: number } | null;
      console.log('decode login:{}',decoded);
      const now = Math.floor(Date.now() / 1000);
      const ttl = decoded?.exp ? decoded.exp - now : this.configService.jwtExpiration;
      if (ttl > 0) {
        await this.redisService.blacklistToken(oldToken, ttl);
      }
    }

    const payload = { 
      sub: user.id, 
      username: user.username, 
      role: user.role,
      employee_id: user.employee_id,
      branch_code: user.branch_code,
      jti: Math.random().toString(36).substring(7)
    };
    const access_token = await this.jwtService.signAsync(payload);
    const decoded = this.jwtService.decode(access_token);
    console.log('decode access_token:{}',decoded);
    const date = new Date(decoded.exp * 1000);
    console.log('token expired:{}',date.toLocaleString('th-TH')); // "14/3/2026 15:00:00"
 
    // Store new session
    await this.redisService.setUserSession(user.username, access_token, this.configService.jwtExpiration); 

    return { access_token, role: user.role ,username:user.username,employee_id:user.employee_id,branch_code:user.branch_code};
  }

  async logout(token: string, username: string): Promise<void> {
    // Decode token to get remaining TTL
    const decoded = this.jwtService.decode(token);
           const date = new Date(decoded.exp * 1000);
    console.log(date.toLocaleString('th-TH')); // "14/3/2026 15:00:00"

    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded?.exp ? decoded.exp - now : this.configService.jwtExpiration;

    if (ttl > 0) {
      await this.redisService.blacklistToken(token, ttl);
    }

    // Clear active session
    await this.redisService.deleteUserSession(username);
  }

  async refresh(oldToken: string, user: { username: string }): Promise<any> {
    // 1. Double check session in Redis
    const currentSession = await this.redisService.getUserSession(user.username);
    if (!currentSession || currentSession !== oldToken) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // 2. Fetch fresh user data
    const freshUser = await this.userRepository.findByUsername(this.dataSource.manager, user.username);
    if (!freshUser) {
      throw new UnauthorizedException('User not found');
    }

    // 3. Blacklist old token
    const decoded = this.jwtService.decode(oldToken) as { exp?: number } | null;
    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded?.exp ? decoded.exp - now : this.configService.jwtExpiration;
    if (ttl > 0) {
      await this.redisService.blacklistToken(oldToken, ttl);
    }

    // 4. Generate new token
    const payload = { 
      sub: freshUser.id, 
      username: freshUser.username, 
      role: freshUser.role,
      employee_id: freshUser.employee_id,
      branch_code: freshUser.branch_code,
      jti: Math.random().toString(36).substring(7)
    };
    const access_token = await this.jwtService.signAsync(payload);

    // 5. Update session in Redis
    await this.redisService.setUserSession(freshUser.username, access_token, this.configService.jwtExpiration);

    return { 
      access_token, 
      role: freshUser.role,
      username: freshUser.username,
      employee_id: freshUser.employee_id,
      branch_code: freshUser.branch_code
    };
  }
}

