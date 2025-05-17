import { Inject, Injectable } from '@nestjs/common';
import { FollowAggregate } from '../../../domain/aggregates/follow/follow.aggregate';
import {
  ConflictException,
  ResourceNotFoundException,
} from '../../../domain/exceptions/domain.exceptions';
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
      throw new ResourceNotFoundException('User', followerId);
    }

    const followedExists = await this.userRepository.findById(followedId);
    if (!followedExists) {
      throw new ResourceNotFoundException('User', followedId);
    }

    const alreadyFollowing = await this.followRepository.isFollowing(
      followerId,
      followedId,
    );

    if (alreadyFollowing) {
      throw new ConflictException('Already following this user');
    }

    const followAggregate = FollowAggregate.create(followerId, followedId);
    await this.followRepository.create(followAggregate);

    const followDTO = followAggregate.toDTO();
    return {
      id: followDTO.id,
      followerId: followDTO.followerId,
      followedId: followDTO.followedId,
      createdAt: followDTO.createdAt,
    };
  }
}
