import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TweetAggregate } from '../../domain/aggregates/tweet/tweet.aggregate';

/**
 * Data Transfer Object para crear un tweet
 */
export class CreateTweetDto {
  @IsString({ message: 'Tweet content must be a string' })
  @IsNotEmpty({ message: 'Tweet content cannot be empty' })
  @MaxLength(TweetAggregate.MAX_TWEET_LENGTH, {
    message: `Tweet content cannot exceed ${TweetAggregate.MAX_TWEET_LENGTH} characters`,
  })
  content: string;
}

/**
 * Data Transfer Object para respuesta al pedir un tweet
 */
export class TweetDto {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}
