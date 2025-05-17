import { Injectable, Inject } from '@nestjs/common';
import { TweetAggregate } from '../aggregates/tweet/tweet.aggregate';
import { TweetService } from '../interfaces/service/tweet-service.interface';
import { TweetRepository } from '../interfaces/repository/tweet-repository.interface';
import { TWEET_REPOSITORY } from '../interfaces/repository/repository.tokens';
import { TweetNotFoundException } from '../exceptions/domain.exceptions';

@Injectable()
export class TweetServiceImpl implements TweetService {
  constructor(
    @Inject(TWEET_REPOSITORY)
    private readonly tweetRepository: TweetRepository,
  ) {}

  async createTweet(tweet: TweetAggregate): Promise<TweetAggregate> {
    await this.tweetRepository.create(tweet);
    return tweet;
  }

  async getTweetById(tweetId: string): Promise<TweetAggregate | null> {
    const tweet = await this.tweetRepository.findById(tweetId);

    if (!tweet) {
      throw new TweetNotFoundException(tweetId);
    }

    return tweet;
  }

  async getUserTweets(userId: string): Promise<TweetAggregate[]> {
    return this.tweetRepository.findByUserId(userId);
  }

  async getTimelineTweets(
    userId: string,
    followedUserIds: string[],
  ): Promise<TweetAggregate[]> {
    const userTweets = await this.tweetRepository.findByUserId(userId);

    const followedTweets: TweetAggregate[] = [];

    for (const followedId of followedUserIds) {
      const tweets = await this.tweetRepository.findByUserId(followedId);
      followedTweets.push(...tweets);
    }

    const allTweets = [...userTweets, ...followedTweets];

    return this.sortByRecency(allTweets);
  }

  private sortByRecency(tweets: TweetAggregate[]): TweetAggregate[] {
    return [...tweets].sort((a, b) => {
      const dateA = a.getCreatedAt().getTime();
      const dateB = b.getCreatedAt().getTime();
      return dateB - dateA;
    });
  }
}
