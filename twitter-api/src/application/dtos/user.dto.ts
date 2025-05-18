import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserAggregate } from '../../domain/aggregates/user/user.aggregate';

/**
 * Data Transfer Object para crear un usuario
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'Username for the user, must be unique',
    example: 'john_doe',
    minLength: UserAggregate.MIN_USERNAME_LENGTH,
    maxLength: UserAggregate.MAX_USERNAME_LENGTH,
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username cannot be empty' })
  @MinLength(UserAggregate.MIN_USERNAME_LENGTH, {
    message: `Username min length is ${UserAggregate.MIN_USERNAME_LENGTH} chars`,
  })
  @MaxLength(UserAggregate.MAX_USERNAME_LENGTH, {
    message: `Username max length is ${UserAggregate.MAX_USERNAME_LENGTH} chars`,
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty({
    description: 'Display name for the user',
    example: 'John Doe',
    minLength: UserAggregate.MIN_DISPLAY_NAME_LENGTH,
    maxLength: UserAggregate.MAX_DISPLAY_NAME_LENGTH,
  })
  @IsString({ message: 'Display name must be a string' })
  @IsNotEmpty({ message: 'Display name cannot be empty' })
  @MinLength(UserAggregate.MIN_DISPLAY_NAME_LENGTH, {
    message: `Display name min length is ${UserAggregate.MIN_DISPLAY_NAME_LENGTH} chars`,
  })
  @MaxLength(UserAggregate.MAX_DISPLAY_NAME_LENGTH, {
    message: `Display name max length is ${UserAggregate.MAX_DISPLAY_NAME_LENGTH} chars`,
  })
  displayName: string;
}

/**
 * Data Transfer Object para respuesta al pedir un usuario
 */
export class UserDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Display name of the user',
    example: 'John Doe',
  })
  displayName: string;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2023-06-01T12:00:00.000Z',
  })
  createdAt: Date;
}
