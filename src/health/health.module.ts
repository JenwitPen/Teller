import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { CommonModule } from '../common/common.module';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule, CommonModule],
  controllers: [HealthController],
})
export class HealthModule { }
