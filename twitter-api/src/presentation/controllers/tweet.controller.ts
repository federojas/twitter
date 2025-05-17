import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { CreateTweetDto, TweetDto } from '../../application/dtos/tweet.dto';
import { CreateTweetUseCase } from '../../application/use-cases/tweet/create-tweet.use-case';
import { GetTweetByIdUseCase } from '../../application/use-cases/tweet/get-tweets.use-case';
import { GetTimelineUseCase } from '../../application/use-cases/tweet/get-timeline.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { MissingAuthorizationHeaderException } from 'src/domain/exceptions/domain.exceptions';
import {
  PaginatedResult,
  PaginationParams,
} from '../../application/dtos/pagination.dto';

/**
 * Tweet Controller
 * Mapea API inputs a application use cases y use case outputs a API responses
 */
@Controller('tweets')
@UseFilters(DomainExceptionFilter)
export class TweetController {
  constructor(
    private readonly createTweetUseCase: CreateTweetUseCase,
    private readonly getTweetByIdUseCase: GetTweetByIdUseCase,
    private readonly getTimelineUseCase: GetTimelineUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTweet(
    @Headers('authorization') authorization: string,
    @Body() createTweetDto: CreateTweetDto,
  ): Promise<TweetDto> {
    if (!authorization) {
      throw new MissingAuthorizationHeaderException();
    }

    const userId = authorization;
    return await this.createTweetUseCase.execute(userId, createTweetDto);
  }

  @Get('timeline')
  async getTimeline(
    @Headers('authorization') authorization: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<PaginatedResult<TweetDto>> {
    if (!authorization) {
      throw new MissingAuthorizationHeaderException();
    }

    const pagination = new PaginationParams(
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined,
    );

    return this.getTimelineUseCase.execute(authorization, pagination);
  }

  @Get(':id')
  async getTweetById(@Param('id') id: string): Promise<TweetDto> {
    return this.getTweetByIdUseCase.execute(id);
  }
}
