import { Injectable } from '@nestjs/common';

export interface DbConfig {
  user: string;
  password: string;
  server: string;
  database: string;
  encrypt: boolean;
  multiSubnetFailover: boolean;
  applicationIntent: 'ReadWrite' | 'ReadOnly';
}

interface JdbcParts {
  serverName?: string;
  databaseName?: string;
  encrypt?: string;
  multiSubnetFailover?: string;
  applicationIntent?: string;
}

@Injectable()
export class ConfigService {
  get dbConfig(): DbConfig {
    const jdbc = process.env.DB_JDBC_URL;
    const parts = jdbc ? this.parseJdbcUrl(jdbc) : {};

    const server =
      parts.serverName || process.env.DB_SERVER || process.env.DB_HOST || 'localhost';
    const database =
      parts.databaseName || process.env.DB_NAME || process.env.DB_DATABASE || 'teller';
    const encryptRaw = parts.encrypt || process.env.DB_ENCRYPT || 'true';
    const multiSubnetFailoverRaw =
      parts.multiSubnetFailover || process.env.DB_MULTI_SUBNET_FAILOVER || 'true';
    const applicationIntentRaw =
      parts.applicationIntent || process.env.DB_APPLICATION_INTENT || 'ReadWrite';

    return {
      user: process.env.DB_USER || process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD || 'MyPass@word',
      server,
      database,
      encrypt: encryptRaw.toLowerCase() === 'true',
      multiSubnetFailover: multiSubnetFailoverRaw.toLowerCase() === 'true',
      applicationIntent: (applicationIntentRaw === 'ReadOnly'
        ? 'ReadOnly'
        : 'ReadWrite') as 'ReadWrite' | 'ReadOnly',
    };
  }

  get dbPort(): number {
    const raw = process.env.DB_PORT || '1433';
    return Number(raw);
  }

  get redisHost(): string {
    return process.env.REDIS_HOST || '127.0.0.1';
  }

  get redisPort(): number {
    const raw = process.env.REDIS_PORT || '6379';
    return Number(raw);
  }

  get redisPassword(): string | undefined {
    return process.env.REDIS_PASSWORD || undefined;
  }

  get cacheTtlSeconds(): number {
    const raw = process.env.CACHE_TTL_SECONDS || '60';
    return Number(raw);
  }

  get jwtExpiration(): number {
    const raw = process.env.JWT_EXPIRATION || '3600';
    return Number(raw);
  }

  private parseJdbcUrl(url: string): JdbcParts {
    if (!url.startsWith('jdbc:sqlserver://')) {
      return {};
    }

    const parts: JdbcParts = {};
    const remainder = url.replace('jdbc:sqlserver://', '');
    const tokens = remainder.split(';').filter((token) => token.length > 0);

    for (const token of tokens) {
      const [key, value] = token.split('=');
      if (!key || value === undefined) {
        continue;
      }
      if (key === 'serverName') {
        parts.serverName = value;
      } else if (key === 'databaseName') {
        parts.databaseName = value;
      } else if (key === 'encrypt') {
        parts.encrypt = value;
      } else if (key === 'multiSubnetFailover') {
        parts.multiSubnetFailover = value;
      } else if (key === 'applicationIntent') {
        parts.applicationIntent = value;
      }
    }

    return parts;
  }
}
