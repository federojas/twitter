import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { CreateFollowUseCase } from './follow/create-follow.use-case';
import {
  GetFollowersUseCase,
  GetFollowingUseCase,
} from './follow/get-follows.use-case';

@Module({
  imports: [DomainModule, InfrastructureModule],
  providers: [CreateFollowUseCase, GetFollowersUseCase, GetFollowingUseCase],
  exports: [CreateFollowUseCase, GetFollowersUseCase, GetFollowingUseCase],
})
export class FollowUseCasesModule {}
