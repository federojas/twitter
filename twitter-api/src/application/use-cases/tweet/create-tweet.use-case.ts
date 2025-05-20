import { Inject, Injectable } from '@nestjs/common';
import { TweetAggregate } from '../../../domain/aggregates/tweet/tweet.aggregate';
import { CreateTweetDto, TweetDto } from '../../dtos/tweet.dto';
import { TweetService } from 'src/domain/interfaces/service/tweet-service.interface';
import { UserService } from 'src/domain/interfaces/service/user-service.interface';
import {
  TWEET_SERVICE,
  USER_SERVICE,
} from 'src/domain/interfaces/service/service.tokens';

@Injectable()
export class CreateTweetUseCase {
  constructor(
    @Inject(TWEET_SERVICE)
    private readonly tweetService: TweetService,
    @Inject(USER_SERVICE)
    private readonly userService: UserService,
  ) {}

  async execute(
    userId: string,
    createTweetDto: CreateTweetDto,
  ): Promise<TweetDto> {
    await this.userService.getUserById(userId);

    const tweetAggregate = TweetAggregate.create(
      createTweetDto.content,
      userId,
    );

    await this.tweetService.createTweet(tweetAggregate);

    const tweetDto = tweetAggregate.toDTO() as TweetDto;
    return tweetDto;
  }
}
