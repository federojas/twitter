import { Inject, Injectable } from '@nestjs/common';
import { FollowAggregate } from '../../../domain/aggregates/follow/follow.aggregate';
import { FollowRepository } from '../../../domain/repositories/follow-repository.interface';
import {
  FOLLOW_REPOSITORY,
  USER_REPOSITORY,
} from '../../../domain/repositories/repository.tokens';
import { UserRepository } from '../../../domain/repositories/user-repository.interface';
import { FollowDto } from '../../dtos/follow.dto';

@Injectable()
export class CreateFollowUseCase {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(followerId: string, followedId: string): Promise<FollowDto> {
    const followerExists = await this.userRepository.findById(followerId);
    if (!followerExists) {
      throw new Error('Follower user not found');
    }

    const followedExists = await this.userRepository.findById(followedId);
    if (!followedExists) {
      throw new Error('User to follow not found');
    }

    const alreadyFollowing = await this.followRepository.isFollowing(
      followerId,
      followedId,
    );

    if (alreadyFollowing) {
      throw new Error('Already following this user');
    }

    try {
      const followAggregate = FollowAggregate.create(followerId, followedId);
      await this.followRepository.create(followAggregate);

      const followDTO = followAggregate.toDTO();
      return {
        id: followDTO.id,
        followerId: followDTO.followerId,
        followedId: followDTO.followedId,
        createdAt: followDTO.createdAt,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Users cannot follow themselves'
      ) {
        throw new Error('Cannot follow yourself');
      }
      throw error;
    }
  }
}
