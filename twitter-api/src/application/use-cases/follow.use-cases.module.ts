import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { CreateFollowUseCase } from './follow/create-follow.use-case';
import {
  GetFollowersUseCase,
  GetFollowingUseCase,
} from './follow/get-user-follows.use-case';
import { GetFollowByIdUseCase } from './follow/get-follows.use-case';

@Module({
  imports: [DomainModule, InfrastructureModule],
  providers: [
    CreateFollowUseCase,
    GetFollowersUseCase,
    GetFollowingUseCase,
    GetFollowByIdUseCase,
  ],
  exports: [
    CreateFollowUseCase,
    GetFollowersUseCase,
    GetFollowingUseCase,
    GetFollowByIdUseCase,
  ],
})
export class FollowUseCasesModule {}
