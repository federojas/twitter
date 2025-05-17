import { Inject, Injectable } from '@nestjs/common';
import { FollowRepository } from '../../../domain/repositories/follow-repository.interface';
import {
  FOLLOW_REPOSITORY,
  USER_REPOSITORY,
} from '../../../domain/repositories/repository.tokens';
import { UserRepository } from '../../../domain/repositories/user-repository.interface';
import { FollowUserDto } from '../../dtos/follow.dto';
import { UserNotFoundException } from 'src/domain/exceptions/domain.exceptions';

@Injectable()
export class GetFollowersUseCase {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<FollowUserDto[]> {
    const userExists = await this.userRepository.findById(userId);
    if (!userExists) {
      throw new UserNotFoundException(userId);
    }

    const follows = await this.followRepository.findFollowers(userId);

    const followerDtos: FollowUserDto[] = [];

    for (const follow of follows) {
      const followerId = follow.getFollowerId();
      const follower = await this.userRepository.findById(followerId);

      if (follower) {
        const isFollowing = await this.followRepository.isFollowing(
          userId,
          followerId,
        );

        followerDtos.push({
          id: follower.getId(),
          username: follower.getUsername(),
          displayName: follower.getDisplayName(),
          following: isFollowing,
        });
      }
    }

    return followerDtos;
  }
}

@Injectable()
export class GetFollowingUseCase {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<FollowUserDto[]> {
    const userExists = await this.userRepository.findById(userId);
    if (!userExists) {
      throw new UserNotFoundException(userId);
    }

    const follows = await this.followRepository.findFollowing(userId);

    const followingDtos: FollowUserDto[] = [];

    for (const follow of follows) {
      const followedId = follow.getFollowedId();
      const followed = await this.userRepository.findById(followedId);

      if (followed) {
        followingDtos.push({
          id: followed.getId(),
          username: followed.getUsername(),
          displayName: followed.getDisplayName(),
          following: true,
        });
      }
    }

    return followingDtos;
  }
}
