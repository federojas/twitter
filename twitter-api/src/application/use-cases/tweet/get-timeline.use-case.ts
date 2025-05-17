import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../../../domain/exceptions/domain.exceptions';
import { FollowRepository } from '../../../domain/repositories/follow-repository.interface';
import { TweetRepository } from '../../../domain/repositories/tweet-repository.interface';
import { UserRepository } from '../../../domain/repositories/user-repository.interface';
import {
  FOLLOW_REPOSITORY,
  TWEET_REPOSITORY,
  USER_REPOSITORY,
} from '../../../domain/repositories/repository.tokens';
import { TweetDto } from '../../dtos/tweet.dto';
import { TweetAggregate } from '../../../domain/aggregates/tweet/tweet.aggregate';
import { LinkGenerator } from '../../utils/link-generator';

@Injectable()
export class GetTimelineUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TWEET_REPOSITORY)
    private readonly tweetRepository: TweetRepository,
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
  ) {}

  async execute(userId: string): Promise<TweetDto[]> {
    const userExists = await this.userRepository.findById(userId);
    if (!userExists) {
      throw new UserNotFoundException(userId);
    }

    const follows = await this.followRepository.findFollowing(userId);
    const timelineTweetUserIds = follows.map((follow) =>
      follow.getFollowedId(),
    );

    timelineTweetUserIds.push(userId); // Incluir los tweets propios

    const allTweets: TweetAggregate[] = [];

    for (const id of timelineTweetUserIds) {
      const userTweets = await this.tweetRepository.findByUserId(id);
      allTweets.push(...userTweets);
    }

    allTweets.sort((a, b) => {
      const dateA = a.getCreatedAt().getTime();
      const dateB = b.getCreatedAt().getTime();
      return dateB - dateA;
    });

    const tweetDtos = allTweets.map((tweet) => tweet.toDTO() as TweetDto);
    return LinkGenerator.enhanceTweetsWithLinks(tweetDtos);
  }
}
