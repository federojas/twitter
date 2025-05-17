import { Module } from '@nestjs/common';
import { DomainServicesModule } from './services/services.module';

@Module({
  imports: [DomainServicesModule],
  exports: [DomainServicesModule],
})
export class DomainModule {}
