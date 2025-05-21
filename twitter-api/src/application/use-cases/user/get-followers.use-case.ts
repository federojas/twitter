import { Inject, Injectable } from '@nestjs/common';
import { FollowService } from 'src/domain/interfaces/service/follow-service.interface';
import { UserService } from 'src/domain/interfaces/service/user-service.interface';
import {
  FOLLOW_SERVICE,
  USER_SERVICE,
} from 'src/domain/interfaces/service/service.tokens';
import { PaginatedResult } from 'src/application/dtos/pagination.dto';
import { PaginationParams } from 'src/application/dtos/pagination.dto';
import { UserDto } from 'src/application/dtos/user.dto';

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
  ): Promise<PaginatedResult<UserDto>> {
    await this.userService.getUserById(userId);

    const follows = await this.followService.getUserFollowers(
      userId,
      pagination.page,
      pagination.pageSize,
    );

    const followerDtos: UserDto[] = [];

    for (const follow of follows) {
      const followerId = follow.getFollowerId();
      const follower = await this.userService.getUserById(followerId);

      if (follower) {
        const userDto: UserDto = {
          id: follower.getId(),
          username: follower.getUsername(),
          displayName: follower.getDisplayName(),
          createdAt: follower.getCreatedAt(),
        };

        followerDtos.push(userDto);
      }
    }

    const total = await this.followService.getTotalFollowers(userId);

    return new PaginatedResult<UserDto>(followerDtos, total, pagination);
  }
}
