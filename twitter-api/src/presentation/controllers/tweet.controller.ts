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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateTweetDto, TweetDto } from '../../application/dtos/tweet.dto';
import { CreateTweetUseCase } from '../../application/use-cases/tweet/create-tweet.use-case';
import { GetTweetByIdUseCase } from '../../application/use-cases/tweet/get-tweets.use-case';
import { GetTimelineUseCase } from '../../application/use-cases/tweet/get-timeline.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import {
  MissingAuthorizationHeaderException,
  UnimplementedException,
} from 'src/domain/exceptions/domain.exceptions';
import {
  PaginatedResult,
  PaginationParams,
} from '../../application/dtos/pagination.dto';

/**
 * Tweet Controller
 * Mapea API inputs a application use cases y use case outputs a API responses
 */
@ApiTags('tweets')
@Controller('tweets')
@UseFilters(DomainExceptionFilter)
export class TweetController {
  constructor(
    private readonly createTweetUseCase: CreateTweetUseCase,
    private readonly getTweetByIdUseCase: GetTweetByIdUseCase,
    private readonly getTimelineUseCase: GetTimelineUseCase,
  ) {}

  static readonly TYPE_TIMELINE = 'timeline';

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tweet' })
  @ApiResponse({
    status: 201,
    description: 'Tweet successfully created',
    type: TweetDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Missing Authorization header' })
  async createTweet(
    @Req() request: Request,
    @Body() createTweetDto: CreateTweetDto,
  ): Promise<TweetDto> {
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new MissingAuthorizationHeaderException();
    }

    const userId = authorization.startsWith('Bearer ')
      ? authorization.substring(7).trim()
      : authorization.trim();

    return await this.createTweetUseCase.execute(userId, createTweetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get timeline tweets' })
  @ApiQuery({
    name: 'type',
    enum: ['timeline'],
    description: 'Type of tweets to retrieve',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Timeline tweets retrieved successfully',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/TweetDto' },
        },
        meta: {
          type: 'object',
          properties: {
            currentPage: { type: 'number' },
            totalPages: { type: 'number' },
            pageSize: { type: 'number' },
            totalCount: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing Authorization header' })
  @ApiResponse({ status: 501, description: 'Not implemented' })
  async getTimeline(
    @Req() request: Request,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<PaginatedResult<TweetDto>> {
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new MissingAuthorizationHeaderException();
    }

    const userId = authorization.startsWith('Bearer ')
      ? authorization.substring(7).trim()
      : authorization.trim();

    const pagination = new PaginationParams(
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined,
    );

    if (type === TweetController.TYPE_TIMELINE) {
      return this.getTimelineUseCase.execute(userId, pagination);
    } else {
      throw new UnimplementedException(
        'Querying over all tweets is not implemented. Use type=timeline query parameter to go over the tweets timeline.',
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tweet by ID' })
  @ApiParam({ name: 'id', description: 'Tweet ID' })
  @ApiResponse({ status: 200, description: 'Tweet found', type: TweetDto })
  @ApiResponse({ status: 404, description: 'Tweet not found' })
  async getTweetById(@Param('id') id: string): Promise<TweetDto> {
    return this.getTweetByIdUseCase.execute(id);
  }
}
