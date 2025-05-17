import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { CreateFollowUseCase } from './follow/create-follow.use-case';
import { GetFollowByIdUseCase } from './follow/get-follow-by-id.use-case';

@Module({
  imports: [DomainModule],
  providers: [CreateFollowUseCase, GetFollowByIdUseCase],
  exports: [CreateFollowUseCase, GetFollowByIdUseCase],
})
export class FollowUseCasesModule {}
