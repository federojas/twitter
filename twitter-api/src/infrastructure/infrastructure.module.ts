import { Module } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';
import { RepositoryModule } from './database/in-memory/repository.module';

@Module({
  imports: [DomainModule, RepositoryModule],
  providers: [],
  exports: [RepositoryModule],
})
export class InfrastructureModule {}
