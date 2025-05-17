import { Inject, Injectable } from '@nestjs/common';
import { TweetRepository } from '../../../domain/repository-interfaces/tweet-repository.interface';
import { TWEET_REPOSITORY } from '../../../domain/repository-interfaces/repository.tokens';
import { TweetDto } from '../../dtos/tweet.dto';
import { ResourceNotFoundException } from '../../../domain/exceptions/domain.exceptions';
import { LinkGenerator } from '../../utils/link-generator';

@Injectable()
export class GetTweetByIdUseCase {
  constructor(
    @Inject(TWEET_REPOSITORY)
    private readonly tweetRepository: TweetRepository,
  ) {}

  async execute(id: string): Promise<TweetDto> {
    const tweet = await this.tweetRepository.findById(id);
    if (!tweet) {
      throw new ResourceNotFoundException('Tweet', id);
    }
    const tweetDto = tweet.toDTO() as TweetDto;
    return LinkGenerator.enhanceTweetWithLinks(tweetDto);
  }
}
