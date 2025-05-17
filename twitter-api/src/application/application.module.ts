import { Module } from '@nestjs/common';
import { UserUseCasesModule } from './use-cases/user.use-cases.module';
import { TweetUseCasesModule } from './use-cases/tweet.use-cases.module';
import { FollowUseCasesModule } from './use-cases/follow.use-cases.module';

@Module({
  imports: [UserUseCasesModule, TweetUseCasesModule, FollowUseCasesModule],
  exports: [UserUseCasesModule, TweetUseCasesModule, FollowUseCasesModule],
})
export class ApplicationModule {}
