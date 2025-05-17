import { Module } from '@nestjs/common';
import { RepositoryModule } from './database/in-memory/repository.module';

@Module({
  imports: [RepositoryModule],
  exports: [RepositoryModule],
})
export class InfrastructureModule {}
