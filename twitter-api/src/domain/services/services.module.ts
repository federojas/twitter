import { Module, forwardRef } from '@nestjs/common';
import { UserServiceImpl } from './user.service';
import { TweetServiceImpl } from './tweet.service';
import { FollowServiceImpl } from './follow.service';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';

@Module({
  imports: [forwardRef(() => InfrastructureModule)],
  providers: [
    {
      provide: 'UserService',
      useClass: UserServiceImpl,
    },
    {
      provide: 'TweetService',
      useClass: TweetServiceImpl,
    },
    {
      provide: 'FollowService',
      useClass: FollowServiceImpl,
    },
  ],
  exports: ['UserService', 'TweetService', 'FollowService'],
})
export class DomainServicesModule {}
