import { Module } from '@nestjs/common';
import {
  TWEET_REPOSITORY,
  USER_REPOSITORY,
} from '../../../domain/repositories/repository.tokens';
import { UserRepositoryImpl } from './repositories/user.repository';
import { TweetRepositoryImpl } from './repositories/tweet.repository';

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
  ],
  exports: [USER_REPOSITORY, TWEET_REPOSITORY],
})
export class RepositoryModule {}
