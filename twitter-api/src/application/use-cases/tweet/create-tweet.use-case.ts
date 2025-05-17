import { Inject, Injectable } from '@nestjs/common';
import { TweetAggregate } from '../../../domain/aggregates/tweet/tweet.aggregate';
import { TweetRepository } from '../../../domain/interfaces/repository/tweet-repository.interface';
import {
  TWEET_REPOSITORY,
  USER_REPOSITORY,
} from '../../../domain/interfaces/repository/repository.tokens';
import { CreateTweetDto, TweetDto } from '../../dtos/tweet.dto';
import { UserRepository } from '../../../domain/interfaces/repository/user-repository.interface';
import { UserNotFoundException } from 'src/domain/exceptions/domain.exceptions';
import { LinkGenerator } from '../../utils/link-generator';

@Injectable()
export class CreateTweetUseCase {
  constructor(
    @Inject(TWEET_REPOSITORY)
    private readonly tweetRepository: TweetRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userId: string,
    createTweetDto: CreateTweetDto,
  ): Promise<TweetDto> {
    const userExists = await this.userRepository.findById(userId);
    if (!userExists) {
      throw new UserNotFoundException(userId);
    }

    const tweetAggregate = TweetAggregate.create(
      createTweetDto.content,
      userId,
    );

    await this.tweetRepository.create(tweetAggregate);

    const tweetDto = tweetAggregate.toDTO() as TweetDto;
    return LinkGenerator.enhanceTweetWithLinks(tweetDto);
  }
}
