import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * Data Transfer Object para crear un usuario
 */
export class CreateUserDto {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username cannot be empty' })
  @MinLength(3, { message: 'Username min length is 3 chars' })
  @MaxLength(20, { message: 'Username max length is 20 chars' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @IsString({ message: 'Display name must be a string' })
  @IsNotEmpty({ message: 'Display name cannot be empty' })
  @MaxLength(50, { message: 'Display name max length is 50 chars' })
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
}
