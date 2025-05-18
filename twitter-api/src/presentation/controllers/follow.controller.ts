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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateFollowDto, FollowDto } from '../../application/dtos/follow.dto';
import { CreateFollowUseCase } from '../../application/use-cases/follow/create-follow.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import {
  MethodNotAllowedException,
  MissingAuthorizationHeaderException,
} from '../../domain/exceptions/domain.exceptions';
import { GetFollowByIdUseCase } from '../../application/use-cases/follow/get-follow-by-id.use-case';

@ApiTags('follows')
@Controller('follows')
@UseFilters(DomainExceptionFilter)
export class FollowController {
  constructor(
    private readonly createFollowUseCase: CreateFollowUseCase,
    private readonly getFollowByIdUseCase: GetFollowByIdUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({
    status: 201,
    description: 'Follow relationship successfully created',
    type: FollowDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Missing authorization header' })
  @ApiResponse({ status: 409, description: 'Already following this user' })
  async followUser(
    @Req() request: Request,
    @Body() createFollowDto: CreateFollowDto,
  ): Promise<FollowDto> {
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new MissingAuthorizationHeaderException();
    }

    const followerId = authorization.startsWith('Bearer ')
      ? authorization.substring(7).trim()
      : authorization.trim();

    return this.createFollowUseCase.execute(followerId, createFollowDto.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get follow relationship by ID' })
  @ApiParam({ name: 'id', description: 'Follow relationship ID' })
  @ApiResponse({
    status: 200,
    description: 'Follow relationship found',
    type: FollowDto,
  })
  @ApiResponse({ status: 404, description: 'Follow relationship not found' })
  async getFollowById(@Param('id') id: string): Promise<FollowDto> {
    return this.getFollowByIdUseCase.execute(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all follow relationships' })
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async getFollows(): Promise<null> {
    throw new MethodNotAllowedException(
      'Querying over follow relationships is not allowed.',
    );

    return Promise.resolve(null);
  }
}
