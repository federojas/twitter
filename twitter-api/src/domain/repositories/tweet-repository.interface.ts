import { TweetAggregate } from '../aggregates/tweet/tweet.aggregate';

export interface TweetRepository {
  create(tweet: TweetAggregate): Promise<void>;

  findById(id: string): Promise<TweetAggregate | null>;

  findByUserId(userId: string): Promise<TweetAggregate[]>;

  findAll(): Promise<TweetAggregate[]>;
}
