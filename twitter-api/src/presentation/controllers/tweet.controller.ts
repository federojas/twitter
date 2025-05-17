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
import { CreateTweetDto, TweetDto } from '../../application/dtos/tweet.dto';
import { CreateTweetUseCase } from '../../application/use-cases/tweet/create-tweet.use-case';
import { GetTweetByIdUseCase } from '../../application/use-cases/tweet/get-tweets.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { MissingAuthorizationHeaderException } from 'src/domain/exceptions/domain.exceptions';

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

  @Get(':id')
  async getTweetById(@Param('id') id: string): Promise<TweetDto> {
    return this.getTweetByIdUseCase.execute(id);
  }
}
