import { ConfigService } from '@nestjs/config';
import { BullRootModuleOptions, SharedBullConfigurationFactory } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private configService: ConfigService) {}

  createSharedConfiguration(): BullRootModuleOptions {
    return {
    connection: {
        url: this.configService.get<string>("REDIS_URI")
    }
    };
  }
}