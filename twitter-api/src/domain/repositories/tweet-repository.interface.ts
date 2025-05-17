import { TweetAggregate } from '../aggregates/tweet/tweet.aggregate';

export interface TweetRepository {
  create(tweet: TweetAggregate): Promise<void>;
  findById(id: string): Promise<TweetAggregate | null>;

  // Read-optimized methods
  findByUserId(userId: string): Promise<TweetAggregate[]>;
  findRecentTweets(limit: number): Promise<TweetAggregate[]>;
  findTweetsByUsername(username: string): Promise<TweetAggregate[]>;
}
