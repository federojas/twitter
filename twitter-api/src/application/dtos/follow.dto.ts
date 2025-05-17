import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object para crear un follow
 */
export class CreateFollowDto {
  @IsString({ message: 'User ID to follow must be a string' })
  @IsNotEmpty({ message: 'User ID to follow cannot be empty' })
  userId: string;
}

/**
 * Data Transfer Object para respuesta al pedir un follow
 */
export class FollowDto {
  id: string;
  followerId: string;
  followedId: string;
  createdAt: string;

  // HATEOAS
  links: {
    self: string;
    follower: string;
    followed: string;
  };
}

/**
 * Data Transfer Object para respuesta de followed/following usuarios
 */
export class FollowUserDto {
  id: string;
  username: string;
  displayName: string;
  following: boolean;

  // HATEOAS
  links: {
    self: string;
  };
}
