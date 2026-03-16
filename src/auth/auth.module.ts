import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserModule } from '../user/user.module';
import { CommonModule } from '../common/common.module';
import { ConfigService } from '../common/config/config.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    CommonModule,
    JwtModule.registerAsync({
      imports: [CommonModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-prod',
        signOptions: { expiresIn: `${config.jwtExpiration}s` },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
