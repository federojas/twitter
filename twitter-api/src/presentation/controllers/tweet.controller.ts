import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CreateTweetDto, TweetDto } from '../../application/dtos/tweet.dto';
import { CreateTweetUseCase } from '../../application/use-cases/tweet/create-tweet.use-case';
import { GetTweetByIdUseCase } from '../../application/use-cases/tweet/get-tweets.use-case';

/**
 * Tweet Controller
 * Mapea API inputs a application use cases y use case outputs a API responses
 */
@Controller('tweets')
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
    try {
      if (!authorization) {
        throw new BadRequestException('Missing Authorization header');
      }

      const userId = authorization;
      return await this.createTweetUseCase.execute(userId, createTweetDto);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'User not found') {
        throw new NotFoundException(`User not found`);
      }
      throw error;
    }
  }

  @Get(':id')
  async getTweetById(@Param('id') id: string): Promise<TweetDto> {
    const tweet = await this.getTweetByIdUseCase.execute(id);
    if (!tweet) {
      throw new NotFoundException(`Tweet with ID ${id} not found`);
    }
    return tweet;
  }
}
