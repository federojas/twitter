import { Inject, Injectable } from '@nestjs/common';
import { TweetDto } from '../../dtos/tweet.dto';
import { LinkGenerator } from '../../utils/link-generator';
import { TweetService } from 'src/domain/interfaces/service/tweet-service.interface';
import { TWEET_SERVICE } from 'src/domain/interfaces/service/service.tokens';
import { TweetNotFoundException } from '../../../domain/exceptions/domain.exceptions';

@Injectable()
export class GetTweetByIdUseCase {
  constructor(
    @Inject(TWEET_SERVICE)
    private readonly tweetService: TweetService,
  ) {}

  async execute(id: string): Promise<TweetDto> {
    const tweet = await this.tweetService.getTweetById(id);

    if (!tweet) {
      throw new TweetNotFoundException(id);
    }

    const tweetDto = tweet.toDTO() as TweetDto;
    return LinkGenerator.enhanceTweetWithLinks(tweetDto);
  }
}
