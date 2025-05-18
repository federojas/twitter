import { Inject, Injectable } from '@nestjs/common';
import { FollowDto } from '../../dtos/follow.dto';
import { FollowService } from 'src/domain/interfaces/service/follow-service.interface';
import { UserService } from 'src/domain/interfaces/service/user-service.interface';
import {
  FOLLOW_SERVICE,
  USER_SERVICE,
} from 'src/domain/interfaces/service/service.tokens';

@Injectable()
export class CreateFollowUseCase {
  constructor(
    @Inject(FOLLOW_SERVICE)
    private readonly followService: FollowService,
    @Inject(USER_SERVICE)
    private readonly userService: UserService,
  ) {}

  async execute(followerId: string, followedId: string): Promise<FollowDto> {
    await this.userService.getUserById(followerId);
    await this.userService.getUserById(followedId);

    const followAggregate = await this.followService.createFollow(
      followerId,
      followedId,
    );

    const followDTO = followAggregate.toDTO() as FollowDto;
    return followDTO;
  }
}
