import { TweetDto } from '../dtos/tweet.dto';
import { UserDto } from '../dtos/user.dto';
import { FollowDto, FollowUserDto } from '../dtos/follow.dto';

/**
 * Clase para agregar HATEOAS links a los recursos de la API
 */
export class LinkGenerator {
  private static get API_URL(): string {
    return process.env.API_URL || 'http://api.localhost';
  }

  private static get API_PORT(): string {
    return process.env.API_PORT || '3000';
  }

  private static get API_BASE_URL(): string {
    return `${this.API_URL}:${this.API_PORT}`;
  }

  private static resourceUrl(resource: string, id: string): string {
    return `${this.API_BASE_URL}/${resource}/${id}`;
  }

  static userUrl(userId: string): string {
    return this.resourceUrl('users', userId);
  }

  static tweetUrl(tweetId: string): string {
    return this.resourceUrl('tweets', tweetId);
  }

  static followUrl(followId: string): string {
    return this.resourceUrl('follows', followId);
  }

  static generateTweetLinks(
    tweetId: string,
    userId: string,
  ): { self: string; user: string } {
    return {
      self: this.tweetUrl(tweetId),
      user: this.userUrl(userId),
    };
  }

  static generateUserLinks(userId: string): { self: string } {
    return {
      self: this.userUrl(userId),
    };
  }

  static generateFollowLinks(
    followId: string,
    followerId: string,
    followedId: string,
  ): { self: string; follower: string; followed: string } {
    return {
      self: this.followUrl(followId),
      follower: this.userUrl(followerId),
      followed: this.userUrl(followedId),
    };
  }

  static generateFollowUserLinks(userId: string): { self: string } {
    return {
      self: this.userUrl(userId),
    };
  }

  static enhanceTweetWithLinks(tweet: TweetDto): TweetDto {
    return {
      ...tweet,
      links: this.generateTweetLinks(tweet.id, tweet.userId),
    };
  }

  static enhanceUserWithLinks(user: UserDto): UserDto {
    return {
      ...user,
      links: this.generateUserLinks(user.id),
    };
  }

  static enhanceFollowWithLinks(follow: FollowDto): FollowDto {
    return {
      ...follow,
      links: this.generateFollowLinks(
        follow.id,
        follow.followerId,
        follow.followedId,
      ),
    };
  }

  static enhanceFollowUserWithLinks(followUser: FollowUserDto): FollowUserDto {
    return {
      ...followUser,
      links: this.generateFollowUserLinks(followUser.id),
    };
  }

  static enhanceTweetsWithLinks(tweets: TweetDto[]): TweetDto[] {
    return tweets.map((tweet) => this.enhanceTweetWithLinks(tweet));
  }

  static enhanceUsersWithLinks(users: UserDto[]): UserDto[] {
    return users.map((user) => this.enhanceUserWithLinks(user));
  }

  static enhanceFollowsWithLinks(follows: FollowDto[]): FollowDto[] {
    return follows.map((follow) => this.enhanceFollowWithLinks(follow));
  }

  static enhanceFollowUsersWithLinks(
    followUsers: FollowUserDto[],
  ): FollowUserDto[] {
    return followUsers.map((followUser) =>
      this.enhanceFollowUserWithLinks(followUser),
    );
  }
}
