import { Inject, Injectable } from '@nestjs/common';
import { LinkGenerator } from '../../utils/link-generator';
import { FollowRepository } from '../../../domain/repository-interfaces/follow-repository.interface';
import { FOLLOW_REPOSITORY } from '../../../domain/repository-interfaces/repository.tokens';
import { FollowDto } from '../../dtos/follow.dto';
import { ResourceNotFoundException } from '../../../domain/exceptions/domain.exceptions';

@Injectable()
export class GetFollowByIdUseCase {
  constructor(
    @Inject(FOLLOW_REPOSITORY)
    private readonly followRepository: FollowRepository,
  ) {}

  async execute(id: string): Promise<FollowDto> {
    const follow = await this.followRepository.findById(id);
    if (!follow) {
      throw new ResourceNotFoundException('Follow', id);
    }

    const followDto = follow.toDTO() as FollowDto;
    return LinkGenerator.enhanceFollowWithLinks(followDto);
  }
}
