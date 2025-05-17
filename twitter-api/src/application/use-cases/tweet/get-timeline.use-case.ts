import { Inject, Injectable } from '@nestjs/common';
import { TweetDto } from '../../dtos/tweet.dto';
import { LinkGenerator } from '../../utils/link-generator';
import { PaginatedResult, PaginationParams } from '../../dtos/pagination.dto';
import { UserService } from 'src/domain/interfaces/service/user-service.interface';
import { TweetService } from 'src/domain/interfaces/service/tweet-service.interface';
import { FollowService } from 'src/domain/interfaces/service/follow-service.interface';
import {
  USER_SERVICE,
  TWEET_SERVICE,
  FOLLOW_SERVICE,
} from 'src/domain/interfaces/service/service.tokens';

@Injectable()
export class GetTimelineUseCase {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserService,
    @Inject(TWEET_SERVICE)
    private readonly tweetService: TweetService,
    @Inject(FOLLOW_SERVICE)
    private readonly followService: FollowService,
  ) {}

  async execute(
    userId: string,
    pagination: PaginationParams = new PaginationParams(),
  ): Promise<PaginatedResult<TweetDto>> {
    await this.userService.getUserById(userId);

    const follows = await this.followService.getUserFollowing(userId);
    const followedUserIds = follows.map((follow) => follow.getFollowedId());

    const allTweets = await this.tweetService.getTimelineTweets(
      userId,
      followedUserIds,
      pagination.page,
      pagination.pageSize,
    );

    const allTweetDtos = allTweets.map((tweet) => tweet.toDTO() as TweetDto);
    const enhancedTweets = LinkGenerator.enhanceTweetsWithLinks(allTweetDtos);

    const total = await this.tweetService.getTotalTimelineTweets(
      userId,
      followedUserIds,
    );

    return new PaginatedResult<TweetDto>(
      enhancedTweets,
      total,
      pagination,
      '/tweets/timeline',
    );
  }
}
