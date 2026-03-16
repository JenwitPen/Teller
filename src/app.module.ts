import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { ConfigService } from './common/config/config.service';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { TransactionHistoryModule } from './transaction-history/transaction-history.module';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';

import { User } from './user/entities/user.model';
import { Account } from './account/entities/account.model';
import { TransactionHistory } from './transaction-history/entities/transaction-history.model';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forRootAsync({
      imports: [CommonModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.dbConfig.server,
        port: config.dbPort,
        username: config.dbConfig.user,
        password: config.dbConfig.password,
        database: config.dbConfig.database,
        entities: [User, Account, TransactionHistory],
        synchronize: false,
        options: {
          encrypt: config.dbConfig.encrypt,
          trustServerCertificate: true,
          multiSubnetFailover: config.dbConfig.multiSubnetFailover,
          applicationIntent: config.dbConfig.applicationIntent,
        },
      }),
    }),
    AuthModule,
    UserModule,
    AccountModule,
    TransactionHistoryModule,
    HealthModule,
  ],
})
export class AppModule {}
