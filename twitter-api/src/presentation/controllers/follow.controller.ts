import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
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

@Controller('follows')
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
    try {
      if (!authorization) {
        throw new BadRequestException('Missing Authorization header');
      }

      const followerId = authorization;
      return await this.createFollowUseCase.execute(
        followerId,
        createFollowDto.userId,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Follower user not found') {
          throw new NotFoundException('Current user not found');
        } else if (error.message === 'User to follow not found') {
          throw new NotFoundException(
            `User with ID ${createFollowDto.userId} not found`,
          );
        } else if (error.message === 'Already following this user') {
          throw new BadRequestException(
            `Already following user with ID ${createFollowDto.userId}`,
          );
        } else if (error.message === 'Cannot follow yourself') {
          throw new BadRequestException('Cannot follow yourself');
        }
      }
      throw error;
    }
  }

  @Get('followers')
  async getFollowers(
    @Headers('authorization') authorization: string,
  ): Promise<FollowUserDto[]> {
    try {
      if (!authorization) {
        throw new BadRequestException('Missing Authorization header');
      }

      const userId = authorization;
      return await this.getFollowersUseCase.execute(userId);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'User not found') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  @Get('following')
  async getFollowing(
    @Headers('authorization') authorization: string,
  ): Promise<FollowUserDto[]> {
    try {
      if (!authorization) {
        throw new BadRequestException('Missing Authorization header');
      }

      const userId = authorization;
      return await this.getFollowingUseCase.execute(userId);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'User not found') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }
}
