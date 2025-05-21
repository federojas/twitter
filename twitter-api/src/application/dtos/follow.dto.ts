import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object para crear un follow
 */
export class CreateFollowDto {
  @ApiProperty({
    description: 'ID of the user to follow',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'User ID to follow must be a string' })
  @IsNotEmpty({ message: 'User ID to follow cannot be empty' })
  userId: string;
}

/**
 * Data Transfer Object para respuesta al pedir un follow
 */
export class FollowDto {
  @ApiProperty({
    description: 'Unique identifier for the follow relationship',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the user who is following',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  followerId: string;

  @ApiProperty({
    description: 'ID of the user being followed',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  followedId: string;

  @ApiProperty({
    description: 'Date when the follow relationship was created',
    example: '2023-06-01T12:00:00.000Z',
  })
  createdAt: string;
}
