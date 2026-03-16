import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: this.config.redisHost,
      port: this.config.redisPort,
      password: this.config.redisPassword,
      maxRetriesPerRequest: 2,
    });
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async acquireLock(key: string, ttlMs: number): Promise<string | null> {
    const token = `${Date.now()}-${Math.random()}`;
    const result = await this.client.set(key, token, 'PX', ttlMs, 'NX');
    return result === 'OK' ? token : null;
  }

  async releaseLock(key: string, token: string): Promise<void> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await this.client.eval(script, 1, key, token);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async blacklistToken(token: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`blacklist:${token}`, '1', 'EX', ttlSeconds);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.client.exists(`blacklist:${token}`);
    return result === 1;
  }

  async setUserSession(username: string, token: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`session:${username}`, token, 'EX', ttlSeconds);
  }

  async getUserSession(username: string): Promise<string | null> {
    return this.client.get(`session:${username}`);
  }

  async deleteUserSession(username: string): Promise<void> {
    await this.client.del(`session:${username}`);
  }
}

