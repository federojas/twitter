import { TweetAggregate } from '../../aggregates/tweet/tweet.aggregate';

export interface TimelineService {
  /**
   * Gets timeline tweets for a user
   *
   * @param userId The ID of the user requesting the timeline
   * @param followedUserIds IDs of users being followed
   * @returns Array of tweet aggregates sorted for the timeline
   */
  getTimelineForUser(
    userId: string,
    followedUserIds: string[],
  ): Promise<TweetAggregate[]>;

  /**
   * Sorts timeline content by recency or relevance
   *
   * @param tweets Array of tweets to sort
   * @returns Sorted array of tweets
   */
  sortTimelineContent(tweets: TweetAggregate[]): TweetAggregate[];

  /**
   * Filters timeline content based on user preferences
   *
   * @param userId The ID of the user
   * @param tweets Array of tweets to filter
   * @returns Filtered array of tweets
   */
  filterTimelineContent(
    userId: string,
    tweets: TweetAggregate[],
  ): Promise<TweetAggregate[]>;

  /**
   * Builds personalized recommendations for the timeline
   *
   * @param userId The ID of the user
   * @param baseTweets Base timeline tweets
   * @returns Timeline with recommended content
   */
  enhanceTimelineWithRecommendations(
    userId: string,
    baseTweets: TweetAggregate[],
  ): Promise<TweetAggregate[]>;
}
