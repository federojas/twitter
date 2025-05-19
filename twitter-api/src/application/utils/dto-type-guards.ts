import { TweetDto } from '../dtos/tweet.dto';
import { UserDto } from '../dtos/user.dto';
import { FollowDto, FollowUserDto } from '../dtos/follow.dto';

export function isTweetDto(obj: unknown): obj is TweetDto {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      'id' in obj &&
      'userId' in obj &&
      'content' in obj,
  );
}

export function isUserDto(obj: unknown): obj is UserDto {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      'id' in obj &&
      'username' in obj &&
      'displayName' in obj &&
      !('followerId' in obj) &&
      !('followedId' in obj),
  );
}

export function isFollowDto(obj: unknown): obj is FollowDto {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      'id' in obj &&
      'followerId' in obj &&
      'followedId' in obj,
  );
}

export function isFollowUserDto(obj: unknown): obj is FollowUserDto {
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      'id' in obj &&
      'username' in obj &&
      'following' in obj,
  );
}
