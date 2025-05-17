import { Inject, Injectable } from '@nestjs/common';
import { LinkGenerator } from '../../utils/link-generator';
import { FollowDto } from '../../dtos/follow.dto';
import { FollowService } from 'src/domain/interfaces/service/follow-service.interface';
import { FOLLOW_SERVICE } from 'src/domain/interfaces/service/service.tokens';
import { FollowNotFoundException } from '../../../domain/exceptions/domain.exceptions';

@Injectable()
export class GetFollowByIdUseCase {
  constructor(
    @Inject(FOLLOW_SERVICE)
    private readonly followService: FollowService,
  ) {}

  async execute(id: string): Promise<FollowDto> {
    const follow = await this.followService.getFollowById(id);

    if (!follow) {
      throw new FollowNotFoundException(id);
    }

    const followDto = follow.toDTO() as FollowDto;
    return LinkGenerator.enhanceFollowWithLinks(followDto);
  }
}
