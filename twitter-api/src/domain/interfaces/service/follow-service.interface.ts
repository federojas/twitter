import { FollowAggregate } from '../../aggregates/follow/follow.aggregate';

export interface FollowService {
  createFollow(
    followerId: string,
    followedId: string,
  ): Promise<FollowAggregate>;

  getFollowById(followId: string): Promise<FollowAggregate | null>;

  getUserFollowers(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<FollowAggregate[]>;

  getUserFollowing(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<FollowAggregate[]>;

  getAllUserFollowing(userId: string): Promise<FollowAggregate[]>;

  getTotalFollowing(userId: string): Promise<number>;

  getTotalFollowers(userId: string): Promise<number>;

  isFollowing(followerId: string, followedId: string): Promise<boolean>;

  unfollow(followerId: string, followedId: string): Promise<boolean>;
}
