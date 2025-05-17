import { FollowAggregate } from '../../aggregates/follow/follow.aggregate';

export interface FollowService {
  createFollow(
    followerId: string,
    followedId: string,
  ): Promise<FollowAggregate>;

  getFollowById(followId: string): Promise<FollowAggregate | null>;

  getUserFollowers(userId: string): Promise<FollowAggregate[]>;

  getUserFollowing(userId: string): Promise<FollowAggregate[]>;

  isFollowing(followerId: string, followedId: string): Promise<boolean>;

  unfollow(followerId: string, followedId: string): Promise<boolean>;
}
