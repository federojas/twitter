import { Injectable } from '@nestjs/common';
import { TweetAggregate } from '../../../../domain/aggregates/tweet/tweet.aggregate';
import { TweetRepository } from '../../../../domain/repositories/tweet-repository.interface';

@Injectable()
export class TweetRepositoryImpl implements TweetRepository {
  // Primary storage
  private readonly tweets: Map<string, TweetAggregate> = new Map();

  // Read-optimized indexes
  private readonly userIdToTweetIds: Map<string, string[]> = new Map();
  private readonly usernameToTweetIds: Map<string, string[]> = new Map();
  private readonly timelineIds: string[] = []; // Sorted by creation time (newest first)

  async create(tweet: TweetAggregate): Promise<void> {
    const id = tweet.getId();
    const userId = tweet.getUserId();
    const username = tweet.getUsername();

    // Update primary storage
    this.tweets.set(id, tweet);

    // Update user ID index
    let userTweets = this.userIdToTweetIds.get(userId);
    if (!userTweets) {
      userTweets = [];
      this.userIdToTweetIds.set(userId, userTweets);
    }
    userTweets.unshift(id); // Add to beginning (newest first)

    // Update username index
    let usernameTweets = this.usernameToTweetIds.get(username);
    if (!usernameTweets) {
      usernameTweets = [];
      this.usernameToTweetIds.set(username, usernameTweets);
    }
    usernameTweets.unshift(id); // Add to beginning (newest first)

    // Update timeline
    this.timelineIds.unshift(id); // Add to beginning (newest first)

    return Promise.resolve();
  }

  async findById(id: string): Promise<TweetAggregate | null> {
    return Promise.resolve(this.tweets.get(id) || null);
  }

  async findByUserId(userId: string): Promise<TweetAggregate[]> {
    const tweetIds = this.userIdToTweetIds.get(userId) || [];
    return Promise.resolve(this.getTweetsByIds(tweetIds));
  }

  async findRecentTweets(limit: number): Promise<TweetAggregate[]> {
    const count = Math.min(limit, this.timelineIds.length);
    const tweetIds = this.timelineIds.slice(0, count);
    return Promise.resolve(this.getTweetsByIds(tweetIds));
  }

  async findTweetsByUsername(username: string): Promise<TweetAggregate[]> {
    const tweetIds = this.usernameToTweetIds.get(username) || [];
    return Promise.resolve(this.getTweetsByIds(tweetIds));
  }

  private getTweetsByIds(ids: string[]): TweetAggregate[] {
    const tweets: TweetAggregate[] = [];

    for (const id of ids) {
      const tweet = this.tweets.get(id);
      if (tweet) {
        tweets.push(tweet);
      }
    }

    return tweets;
  }
}
