import { TweetAggregate } from '../../aggregates/tweet/tweet.aggregate';

export interface TweetService {
  createTweet(tweet: TweetAggregate): Promise<TweetAggregate>;

  getTweetById(tweetId: string): Promise<TweetAggregate | null>;

  getUserTweets(userId: string): Promise<TweetAggregate[]>;

  getTimelineTweets(
    userId: string,
    followedUserIds: string[],
  ): Promise<TweetAggregate[]>;
}
