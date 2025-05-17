import { Module } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';
import { UserUseCasesModule } from './use-cases/user.use-cases.module';

@Module({
  imports: [DomainModule, UserUseCasesModule],
  providers: [],
  exports: [UserUseCasesModule],
})
export class ApplicationModule {}
