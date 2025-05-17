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
    page: number,
    pageSize: number,
  ): Promise<TweetAggregate[]> {
    const userTweets = await this.getUserTweets(userId);

    const followedTweets: TweetAggregate[] = [];

    for (const followedId of followedUserIds) {
      const tweets = await this.getUserTweets(followedId);
      followedTweets.push(...tweets);
    }

    // IMPORTANTE: Paginando a nivel servicio solo porque
    // estoy utilizando un repositorio in-memory dummy,
    // en una base de datos real lo haria a nivel de repositorio
    // utilizando la query de la base de datos para paginar y
    // filtrar como sea necesario

    const allTweets = [...userTweets, ...followedTweets];

    this.sortByRecency(allTweets);

    const total = allTweets.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);

    return allTweets.slice(startIndex, endIndex);
  }

  async getTotalTimelineTweets(
    userId: string,
    followedUserIds: string[],
  ): Promise<number> {
    const userTweets = await this.getUserTweets(userId);

    const followedTweets: TweetAggregate[] = [];

    for (const followedId of followedUserIds) {
      const tweets = await this.getUserTweets(followedId);
      followedTweets.push(...tweets);
    }

    // IMPORTANTE: Paginando a nivel servicio solo porque
    // estoy utilizando un repositorio in-memory dummy,
    // en una base de datos real lo haria a nivel de repositorio
    // utilizando la query de la base de datos para paginar y
    // filtrar como sea necesario

    const allTweets = [...userTweets, ...followedTweets];

    return allTweets.length;
  }

  private sortByRecency(tweets: TweetAggregate[]): TweetAggregate[] {
    return [...tweets].sort((a, b) => {
      const dateA = a.getCreatedAt().getTime();
      const dateB = b.getCreatedAt().getTime();
      return dateB - dateA;
    });
  }
}
