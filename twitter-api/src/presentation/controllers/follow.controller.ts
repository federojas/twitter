import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import {
  CreateFollowDto,
  FollowDto,
  FollowUserDto,
} from '../../application/dtos/follow.dto';
import { CreateFollowUseCase } from '../../application/use-cases/follow/create-follow.use-case';
import {
  GetFollowersUseCase,
  GetFollowingUseCase,
} from '../../application/use-cases/follow/get-follows.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { MissingAuthorizationHeaderException } from 'src/domain/exceptions/domain.exceptions';

@Controller('follows')
@UseFilters(DomainExceptionFilter)
export class FollowController {
  constructor(
    private readonly createFollowUseCase: CreateFollowUseCase,
    private readonly getFollowersUseCase: GetFollowersUseCase,
    private readonly getFollowingUseCase: GetFollowingUseCase,
  ) {}

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

  @Get('followers')
  async getFollowers(
    @Headers('authorization') authorization: string,
  ): Promise<FollowUserDto[]> {
    if (!authorization) {
      throw new MissingAuthorizationHeaderException();
    }

    const userId = authorization;
    return this.getFollowersUseCase.execute(userId);
  }

  @Get('following')
  async getFollowing(
    @Headers('authorization') authorization: string,
  ): Promise<FollowUserDto[]> {
    if (!authorization) {
      throw new MissingAuthorizationHeaderException();
    }

    const userId = authorization;
    return this.getFollowingUseCase.execute(userId);
  }
}
