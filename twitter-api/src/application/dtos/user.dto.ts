import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { UserAggregate } from '../../domain/aggregates/user/user.aggregate';

/**
 * Data Transfer Object para crear un usuario
 */
export class CreateUserDto {
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
  id: string;
  username: string;
  displayName: string;
  createdAt: Date;

  // HATEOAS
  links: {
    self: string;
  };
}
