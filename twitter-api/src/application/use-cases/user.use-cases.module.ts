import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { CreateUserUseCase } from './user/create-user.use-case';
import { GetUserByIdUseCase } from './user/get-users.use-case';
import { GetFollowersUseCase } from './user/get-followers.use-case';
import { GetFollowingUseCase } from './user/get-following.use-case';

@Module({
  imports: [DomainModule],
  providers: [
    CreateUserUseCase,
    GetUserByIdUseCase,
    GetFollowersUseCase,
    GetFollowingUseCase,
  ],
  exports: [
    CreateUserUseCase,
    GetUserByIdUseCase,
    GetFollowersUseCase,
    GetFollowingUseCase,
  ],
})
export class UserUseCasesModule {}
