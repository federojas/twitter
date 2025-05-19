import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { CreateFollowUseCase } from './follow/create-follow.use-case';
import { GetFollowByIdUseCase } from './follow/get-follow-by-id.use-case';
import { UnfollowUseCase } from './follow/unfollow.use-case';

@Module({
  imports: [DomainModule],
  providers: [CreateFollowUseCase, GetFollowByIdUseCase, UnfollowUseCase],
  exports: [CreateFollowUseCase, GetFollowByIdUseCase, UnfollowUseCase],
})
export class FollowUseCasesModule {}
