import { Module } from '@nestjs/common';
import {
  FOLLOW_REPOSITORY,
  TWEET_REPOSITORY,
  USER_REPOSITORY,
} from '../../../domain/interfaces/repository/repository.tokens';
import { UserRepositoryImpl } from './repositories/user.repository';
import { TweetRepositoryImpl } from './repositories/tweet.repository';
import { FollowRepositoryImpl } from './repositories/follow.repository';

@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
    {
      provide: TWEET_REPOSITORY,
      useClass: TweetRepositoryImpl,
    },
    {
      provide: FOLLOW_REPOSITORY,
      useClass: FollowRepositoryImpl,
    },
  ],
  exports: [USER_REPOSITORY, TWEET_REPOSITORY, FOLLOW_REPOSITORY],
})
export class RepositoryModule {}
