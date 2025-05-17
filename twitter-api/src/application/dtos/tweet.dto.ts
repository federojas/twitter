import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Data Transfer Object para crear un tweet
 */
export class CreateTweetDto {
  @IsString({ message: 'Tweet content must be a string' })
  @IsNotEmpty({ message: 'Tweet content cannot be empty' })
  @MaxLength(280, { message: 'Tweet content cannot exceed 280 characters' })
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
