import { Inject, Injectable } from '@nestjs/common';
import { TweetAggregate } from '../../../domain/aggregates/tweet/tweet.aggregate';
import { TweetRepository } from '../../../domain/repositories/tweet-repository.interface';
import { TWEET_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { CreateTweetDto, TweetDto } from '../../dtos/tweet.dto';
import { UserRepository } from '../../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { UserNotFoundException } from 'src/domain/exceptions/domain.exceptions';

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

    return tweetAggregate.toDTO();
  }
}
