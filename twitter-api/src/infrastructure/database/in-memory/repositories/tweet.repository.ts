import { Injectable } from '@nestjs/common';
import { TweetAggregate } from '../../../../domain/aggregates/tweet/tweet.aggregate';
import { TweetRepository } from '../../../../domain/repositories/tweet-repository.interface';

@Injectable()
export class TweetRepositoryImpl implements TweetRepository {
  private readonly tweets: Map<string, TweetAggregate> = new Map();
  private readonly userIdToTweets: Map<string, TweetAggregate[]> = new Map();

  async create(tweet: TweetAggregate): Promise<void> {
    const id = tweet.getId();
    const userId = tweet.getUserId();

    this.tweets.set(id, tweet);

    let userTweets = this.userIdToTweets.get(userId);
    if (!userTweets) {
      userTweets = [];
      this.userIdToTweets.set(userId, userTweets);
    }
    userTweets.unshift(tweet);

    return Promise.resolve();
  }

  async findById(id: string): Promise<TweetAggregate | null> {
    return Promise.resolve(this.tweets.get(id) || null);
  }

  async findByUserId(userId: string): Promise<TweetAggregate[]> {
    return Promise.resolve(this.userIdToTweets.get(userId) || []);
  }

  async findAll(): Promise<TweetAggregate[]> {
    return Promise.resolve(Array.from(this.tweets.values()));
  }
}
