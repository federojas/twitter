import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { CreateUserUseCase } from './user/create-user.use-case';
import { GetUserByIdUseCase } from './user/get-users.use-case';

@Module({
  imports: [DomainModule, InfrastructureModule],
  providers: [CreateUserUseCase, GetUserByIdUseCase],
  exports: [CreateUserUseCase, GetUserByIdUseCase],
})
export class UserUseCasesModule {}
