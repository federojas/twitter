import { Inject, Injectable } from '@nestjs/common';
import { TweetRepository } from '../../../domain/repositories/tweet-repository.interface';
import { TWEET_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { TweetDto } from '../../dtos/tweet.dto';

@Injectable()
export class GetTweetByIdUseCase {
  constructor(
    @Inject(TWEET_REPOSITORY)
    private readonly tweetRepository: TweetRepository,
  ) {}

  async execute(id: string): Promise<TweetDto | null> {
    const tweet = await this.tweetRepository.findById(id);
    if (!tweet) {
      return null;
    }
    return tweet.toDTO();
  }
}
