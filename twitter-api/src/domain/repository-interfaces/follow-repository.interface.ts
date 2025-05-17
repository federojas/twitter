import { FollowAggregate } from '../aggregates/follow/follow.aggregate';

export interface FollowRepository {
  create(follow: FollowAggregate): Promise<void>;

  findById(id: string): Promise<FollowAggregate | null>;

  findByFollowerAndFollowed(
    followerId: string,
    followedId: string,
  ): Promise<FollowAggregate | null>;

  findFollowers(userId: string): Promise<FollowAggregate[]>;

  findFollowing(userId: string): Promise<FollowAggregate[]>;

  isFollowing(followerId: string, followedId: string): Promise<boolean>;

  delete(id: string): Promise<void>;
}
