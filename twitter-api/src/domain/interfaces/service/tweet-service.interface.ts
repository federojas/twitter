import { TweetAggregate } from '../../aggregates/tweet/tweet.aggregate';

export interface TweetService {
  createTweet(tweet: TweetAggregate): Promise<TweetAggregate>;

  getTweetById(tweetId: string): Promise<TweetAggregate | null>;

  getUserTweets(
    userId: string,
    page: number,
    pageSize?: number,
  ): Promise<TweetAggregate[]>;

  getTimelineTweets(
    userId: string,
    followedUserIds: string[],
    page: number,
    pageSize?: number,
  ): Promise<TweetAggregate[]>;

  getTotalTimelineTweets(
    userId: string,
    followedUserIds: string[],
  ): Promise<number>;
}
