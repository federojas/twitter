import { Injectable } from '@nestjs/common';
import { FollowAggregate } from '../../../../domain/aggregates/follow/follow.aggregate';
import { FollowRepository } from '../../../../domain/repository-interfaces/follow-repository.interface';

@Injectable()
export class FollowRepositoryImpl implements FollowRepository {
  private readonly follows: Map<string, FollowAggregate> = new Map();
  private readonly followerToFollowIds: Map<string, Set<string>> = new Map();
  private readonly followedToFollowIds: Map<string, Set<string>> = new Map();
  private readonly followerFollowedToId: Map<string, string> = new Map();

  private getFollowerFollowedKey(
    followerId: string,
    followedId: string,
  ): string {
    return `${followerId}:${followedId}`;
  }

  async create(follow: FollowAggregate): Promise<void> {
    const id = follow.getId();
    const followerId = follow.getFollowerId();
    const followedId = follow.getFollowedId();
    const key = this.getFollowerFollowedKey(followerId, followedId);

    this.follows.set(id, follow);
    this.followerFollowedToId.set(key, id);

    let followerFollows = this.followerToFollowIds.get(followerId);
    if (!followerFollows) {
      followerFollows = new Set<string>();
      this.followerToFollowIds.set(followerId, followerFollows);
    }
    followerFollows.add(id);

    let followedFollows = this.followedToFollowIds.get(followedId);
    if (!followedFollows) {
      followedFollows = new Set<string>();
      this.followedToFollowIds.set(followedId, followedFollows);
    }
    followedFollows.add(id);

    return Promise.resolve();
  }

  async findById(id: string): Promise<FollowAggregate | null> {
    return Promise.resolve(this.follows.get(id) || null);
  }

  async findByFollowerAndFollowed(
    followerId: string,
    followedId: string,
  ): Promise<FollowAggregate | null> {
    const key = this.getFollowerFollowedKey(followerId, followedId);
    const id = this.followerFollowedToId.get(key);
    if (!id) {
      return Promise.resolve(null);
    }
    return Promise.resolve(this.follows.get(id) || null);
  }

  async findFollowers(userId: string): Promise<FollowAggregate[]> {
    const followIds = this.followedToFollowIds.get(userId);
    if (!followIds) {
      return Promise.resolve([]);
    }

    const follows: FollowAggregate[] = [];
    for (const id of followIds) {
      const follow = this.follows.get(id);
      if (follow) {
        follows.push(follow);
      }
    }

    return Promise.resolve(follows);
  }

  async findFollowing(userId: string): Promise<FollowAggregate[]> {
    const followIds = this.followerToFollowIds.get(userId);
    if (!followIds) {
      return Promise.resolve([]);
    }

    const follows: FollowAggregate[] = [];
    for (const id of followIds) {
      const follow = this.follows.get(id);
      if (follow) {
        follows.push(follow);
      }
    }

    return Promise.resolve(follows);
  }

  async isFollowing(followerId: string, followedId: string): Promise<boolean> {
    const key = this.getFollowerFollowedKey(followerId, followedId);
    return Promise.resolve(this.followerFollowedToId.has(key));
  }

  async delete(id: string): Promise<void> {
    const follow = this.follows.get(id);
    if (!follow) {
      return Promise.resolve();
    }

    const followerId = follow.getFollowerId();
    const followedId = follow.getFollowedId();
    const key = this.getFollowerFollowedKey(followerId, followedId);

    const followerFollows = this.followerToFollowIds.get(followerId);
    if (followerFollows) {
      followerFollows.delete(id);
    }

    const followedFollows = this.followedToFollowIds.get(followedId);
    if (followedFollows) {
      followedFollows.delete(id);
    }

    this.follows.delete(id);
    this.followerFollowedToId.delete(key);

    return Promise.resolve();
  }
}
