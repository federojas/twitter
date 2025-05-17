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
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
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
