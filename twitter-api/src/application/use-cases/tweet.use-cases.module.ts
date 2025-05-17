import { Module } from '@nestjs/common';
import { DomainModule } from '../../domain/domain.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { CreateTweetUseCase } from './tweet/create-tweet.use-case';
import { GetTweetByIdUseCase } from './tweet/get-tweets.use-case';
import { GetTimelineUseCase } from './tweet/get-timeline.use-case';

@Module({
  imports: [DomainModule, InfrastructureModule],
  providers: [CreateTweetUseCase, GetTweetByIdUseCase, GetTimelineUseCase],
  exports: [CreateTweetUseCase, GetTweetByIdUseCase, GetTimelineUseCase],
})
export class TweetUseCasesModule {}
