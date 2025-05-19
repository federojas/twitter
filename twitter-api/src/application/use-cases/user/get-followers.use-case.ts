import { Inject, Injectable } from '@nestjs/common';
import { FollowUserDto } from '../../dtos/follow.dto';
import { FollowService } from 'src/domain/interfaces/service/follow-service.interface';
import { UserService } from 'src/domain/interfaces/service/user-service.interface';
import {
  FOLLOW_SERVICE,
  USER_SERVICE,
} from 'src/domain/interfaces/service/service.tokens';
import { PaginatedResult } from 'src/application/dtos/pagination.dto';
import { PaginationParams } from 'src/application/dtos/pagination.dto';

@Injectable()
export class GetFollowersUseCase {
  constructor(
    @Inject(FOLLOW_SERVICE)
    private readonly followService: FollowService,
    @Inject(USER_SERVICE)
    private readonly userService: UserService,
  ) {}

  async execute(
    userId: string,
    pagination: PaginationParams = new PaginationParams(),
  ): Promise<PaginatedResult<FollowUserDto>> {
    await this.userService.getUserById(userId);

    const follows = await this.followService.getUserFollowers(
      userId,
      pagination.page,
      pagination.pageSize,
    );

    const followerDtos: FollowUserDto[] = [];

    for (const follow of follows) {
      const followerId = follow.getFollowerId();
      const follower = await this.userService.getUserById(followerId);

      if (follower) {
        const isFollowing = await this.followService.isFollowing(
          userId,
          followerId,
        );

        const followUserDto: FollowUserDto = {
          id: follower.getId(),
          username: follower.getUsername(),
          displayName: follower.getDisplayName(),
          following: isFollowing,
        };

        followerDtos.push(followUserDto);
      }
    }

    const total = await this.followService.getTotalFollowers(userId);

    return new PaginatedResult<FollowUserDto>(followerDtos, total, pagination);
  }
}
