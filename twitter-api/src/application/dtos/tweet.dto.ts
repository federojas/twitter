import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TweetAggregate } from '../../domain/aggregates/tweet/tweet.aggregate';

/**
 * Data Transfer Object para crear un tweet
 */
export class CreateTweetDto {
  @ApiProperty({
    description: 'Content of the tweet',
    example: 'This is my first tweet!',
    maxLength: TweetAggregate.MAX_TWEET_LENGTH,
  })
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
  @ApiProperty({
    description: 'Unique identifier for the tweet',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Content of the tweet',
    example: 'This is my first tweet!',
  })
  content: string;

  @ApiProperty({
    description: 'ID of the user who created the tweet',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Date when the tweet was created',
    example: '2023-06-01T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'HATEOAS links for the tweet',
    example: {
      self: '/tweets/123e4567-e89b-12d3-a456-426614174000',
      user: '/users/123e4567-e89b-12d3-a456-426614174000',
    },
  })
  // HATEOAS
  links: {
    self: string;
    user: string;
  };
}
