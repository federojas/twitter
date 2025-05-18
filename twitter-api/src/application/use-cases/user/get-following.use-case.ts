import { Inject, Injectable } from '@nestjs/common';
import { FollowUserDto } from '../../dtos/follow.dto';
import { FollowService } from 'src/domain/interfaces/service/follow-service.interface';
import { UserService } from 'src/domain/interfaces/service/user-service.interface';
import {
  FOLLOW_SERVICE,
  USER_SERVICE,
} from 'src/domain/interfaces/service/service.tokens';

@Injectable()
export class GetFollowingUseCase {
  constructor(
    @Inject(FOLLOW_SERVICE)
    private readonly followService: FollowService,
    @Inject(USER_SERVICE)
    private readonly userService: UserService,
  ) {}

  async execute(userId: string): Promise<FollowUserDto[]> {
    await this.userService.getUserById(userId);

    const follows = await this.followService.getUserFollowing(userId);

    const followingDtos: FollowUserDto[] = [];

    for (const follow of follows) {
      const followedId = follow.getFollowedId();
      const followed = await this.userService.getUserById(followedId);

      if (followed) {
        const followUserDto: FollowUserDto = {
          id: followed.getId(),
          username: followed.getUsername(),
          displayName: followed.getDisplayName(),
          following: true,
        };

        followingDtos.push(followUserDto);
      }
    }

    return followingDtos;
  }
}
