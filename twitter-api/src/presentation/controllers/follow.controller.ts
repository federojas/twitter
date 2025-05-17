import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { CreateFollowDto, FollowDto } from '../../application/dtos/follow.dto';
import { CreateFollowUseCase } from '../../application/use-cases/follow/create-follow.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { MissingAuthorizationHeaderException } from '../../domain/exceptions/domain.exceptions';

@Controller('follows')
@UseFilters(DomainExceptionFilter)
export class FollowController {
  constructor(private readonly createFollowUseCase: CreateFollowUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async followUser(
    @Headers('authorization') authorization: string,
    @Body() createFollowDto: CreateFollowDto,
  ): Promise<FollowDto> {
    if (!authorization) {
      throw new MissingAuthorizationHeaderException();
    }

    const followerId = authorization;
    return this.createFollowUseCase.execute(followerId, createFollowDto.userId);
  }
}
