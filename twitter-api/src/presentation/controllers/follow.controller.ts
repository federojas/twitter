import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseFilters,
} from '@nestjs/common';
import { CreateFollowDto, FollowDto } from '../../application/dtos/follow.dto';
import { CreateFollowUseCase } from '../../application/use-cases/follow/create-follow.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import {
  MethodNotAllowedException,
  MissingAuthorizationHeaderException,
  UnimplementedException,
} from '../../domain/exceptions/domain.exceptions';
import { GetFollowByIdUseCase } from '../../application/use-cases/follow/get-follow-by-id.use-case';

@Controller('follows')
@UseFilters(DomainExceptionFilter)
export class FollowController {
  constructor(
    private readonly createFollowUseCase: CreateFollowUseCase,
    private readonly getFollowByIdUseCase: GetFollowByIdUseCase,
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

  @Get(':id')
  async getFollowById(@Param('id') id: string): Promise<FollowDto> {
    return this.getFollowByIdUseCase.execute(id);
  }

  @Get()
  async getFollows(): Promise<null> {
    throw new MethodNotAllowedException(
      'Querying over follow relationships is not allowed.',
    );

    return Promise.resolve(null);
  }
}
