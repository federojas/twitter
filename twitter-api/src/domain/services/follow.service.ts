import { Injectable, Inject } from '@nestjs/common';
import { FollowAggregate } from '../aggregates/follow/follow.aggregate';
import { FollowService } from '../interfaces/service/follow-service.interface';
import { FollowRepository } from '../interfaces/repository/follow-repository.interface';
import { FOLLOW_REPOSITORY } from '../interfaces/repository/repository.tokens';
import {
  ResourceNotFoundException,
  ConflictException,
  ValidationException,
  FollowNotFoundException,
} from '../exceptions/domain.exceptions';

@Injectable()
export class FollowServiceImpl implements FollowService {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
  ) {}

  async createFollow(
    followerId: string,
    followedId: string,
  ): Promise<FollowAggregate> {
    if (followerId === followedId) {
      throw new ValidationException('Users cannot follow themselves');
    }

    const alreadyFollowing = await this.followRepository.isFollowing(
      followerId,
      followedId,
    );

    if (alreadyFollowing) {
      throw new ConflictException('Follow relationship already exists');
    }

    const follow = FollowAggregate.create(followerId, followedId);
    await this.followRepository.create(follow);

    return follow;
  }

  async getFollowById(followId: string): Promise<FollowAggregate | null> {
    const follow = await this.followRepository.findById(followId);

    if (!follow) {
      throw new FollowNotFoundException(followId);
    }

    return follow;
  }

  async getUserFollowers(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<FollowAggregate[]> {
    return this.followRepository.findFollowers(userId, page, pageSize);
  }

  async getUserFollowing(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<FollowAggregate[]> {
    return this.followRepository.findFollowing(userId, page, pageSize);
  }

  async getAllUserFollowing(userId: string): Promise<FollowAggregate[]> {
    return this.followRepository.findAllFollowing(userId);
  }

  async isFollowing(followerId: string, followedId: string): Promise<boolean> {
    return this.followRepository.isFollowing(followerId, followedId);
  }

  async unfollow(followerId: string, followedId: string): Promise<boolean> {
    const follow = await this.followRepository.findByFollowerAndFollowed(
      followerId,
      followedId,
    );

    if (!follow) {
      throw new ResourceNotFoundException('Follow relationship');
    }

    await this.followRepository.delete(follow.getId());

    return true;
  }

  async getTotalFollowing(userId: string): Promise<number> {
    const follows = await this.followRepository.findAllFollowing(userId);

    return follows.length;
  }

  async getTotalFollowers(userId: string): Promise<number> {
    const follows = await this.followRepository.findAllFollowers(userId);

    return follows.length;
  }
}
