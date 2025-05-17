import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { UserController } from './controllers/user.controller';
import { TweetController } from './controllers/tweet.controller';
import { FollowController } from './controllers/follow.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [UserController, TweetController, FollowController],
})
export class PresentationModule {}
