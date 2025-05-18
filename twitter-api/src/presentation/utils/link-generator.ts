import { TweetDto } from '../../application/dtos/tweet.dto';
import { UserDto } from '../../application/dtos/user.dto';
import { FollowDto, FollowUserDto } from '../../application/dtos/follow.dto';

type ResourceLinks = Record<string, string>;

export type ApiResource = TweetDto | UserDto | FollowDto | FollowUserDto;

interface LinkableResource {
  id: string;
  links?: ResourceLinks;
}

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

  private static enhanceWithLinks<T extends LinkableResource>(
    resource: T,
    linkGenerator: (resource: T) => ResourceLinks,
  ): T {
    return {
      ...resource,
      links: linkGenerator(resource),
    };
  }

  private static enhanceCollectionWithLinks<T extends LinkableResource>(
    resources: T[],
    linkGenerator: (resource: T) => ResourceLinks,
  ): T[] {
    return resources.map((resource) =>
      this.enhanceWithLinks(resource, linkGenerator),
    );
  }

  private static getTweetLinks(tweet: TweetDto): ResourceLinks {
    return {
      self: this.tweetUrl(tweet.id),
      user: this.userUrl(tweet.userId),
    };
  }

  private static getUserLinks(user: UserDto): ResourceLinks {
    return {
      self: this.userUrl(user.id),
    };
  }

  private static getFollowLinks(follow: FollowDto): ResourceLinks {
    return {
      self: this.followUrl(follow.id),
      follower: this.userUrl(follow.followerId),
      followed: this.userUrl(follow.followedId),
    };
  }

  private static getFollowUserLinks(followUser: FollowUserDto): ResourceLinks {
    return {
      self: this.userUrl(followUser.id),
    };
  }

  static enhanceTweetWithLinks(tweet: TweetDto): TweetDto {
    return this.enhanceWithLinks(tweet, (t) => this.getTweetLinks(t));
  }

  static enhanceUserWithLinks(user: UserDto): UserDto {
    return this.enhanceWithLinks(user, (u) => this.getUserLinks(u));
  }

  static enhanceFollowWithLinks(follow: FollowDto): FollowDto {
    return this.enhanceWithLinks(follow, (f) => this.getFollowLinks(f));
  }

  static enhanceFollowUserWithLinks(followUser: FollowUserDto): FollowUserDto {
    return this.enhanceWithLinks(followUser, (fu) =>
      this.getFollowUserLinks(fu),
    );
  }

  static enhanceTweetsWithLinks(tweets: TweetDto[]): TweetDto[] {
    return this.enhanceCollectionWithLinks(tweets, (t) =>
      this.getTweetLinks(t),
    );
  }

  static enhanceUsersWithLinks(users: UserDto[]): UserDto[] {
    return this.enhanceCollectionWithLinks(users, (u) => this.getUserLinks(u));
  }

  static enhanceFollowsWithLinks(follows: FollowDto[]): FollowDto[] {
    return this.enhanceCollectionWithLinks(follows, (f) =>
      this.getFollowLinks(f),
    );
  }

  static enhanceFollowUsersWithLinks(
    followUsers: FollowUserDto[],
  ): FollowUserDto[] {
    return this.enhanceCollectionWithLinks(followUsers, (fu) =>
      this.getFollowUserLinks(fu),
    );
  }

  static generatePaginationLinks(
    resourceUrl: string,
    page: number,
    pageSize: number,
    pageCount: number,
    originalQueryParams: Record<string, string> = {},
  ): {
    self: string;
    first: string;
    prev?: string;
    next?: string;
    last: string;
  } {
    const baseUrl = `${this.API_BASE_URL}${resourceUrl}`;

    // Build query string from original params
    const originalQueryString = this.buildQueryString(originalQueryParams);
    const prefix = originalQueryString ? `${originalQueryString}&` : '?';

    const links: {
      self: string;
      first: string;
      prev?: string;
      next?: string;
      last: string;
    } = {
      self: `${baseUrl}${prefix}page=${page}&pageSize=${pageSize}`,
      first: `${baseUrl}${prefix}page=1&pageSize=${pageSize}`,
      last:
        pageCount > 0
          ? `${baseUrl}${prefix}page=${pageCount}&pageSize=${pageSize}`
          : `${baseUrl}${prefix}page=1&pageSize=${pageSize}`,
    };

    if (page > 1) {
      links.prev = `${baseUrl}${prefix}page=${page - 1}&pageSize=${pageSize}`;
    }

    if (page < pageCount) {
      links.next = `${baseUrl}${prefix}page=${page + 1}&pageSize=${pageSize}`;
    }

    return links;
  }

  /**
   * Build query string from query params object
   */
  private static buildQueryString(params: Record<string, string>): string {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const queryParts = Object.entries(params).map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );

    return `?${queryParts.join('&')}`;
  }

  static isTweetDto(obj: unknown): obj is TweetDto {
    return Boolean(
      obj &&
        typeof obj === 'object' &&
        'id' in obj &&
        'userId' in obj &&
        'content' in obj,
    );
  }

  static isUserDto(obj: unknown): obj is UserDto {
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

  static isFollowDto(obj: unknown): obj is FollowDto {
    return Boolean(
      obj &&
        typeof obj === 'object' &&
        'id' in obj &&
        'followerId' in obj &&
        'followedId' in obj,
    );
  }

  static isFollowUserDto(obj: unknown): obj is FollowUserDto {
    return Boolean(
      obj &&
        typeof obj === 'object' &&
        'id' in obj &&
        'username' in obj &&
        'following' in obj,
    );
  }

  static enhanceResourceWithLinks(resource: unknown): unknown {
    if (!resource || typeof resource !== 'object') return resource;

    if (this.isTweetDto(resource)) {
      return this.enhanceTweetWithLinks(resource);
    }

    if (this.isUserDto(resource)) {
      return this.enhanceUserWithLinks(resource);
    }

    if (this.isFollowDto(resource)) {
      return this.enhanceFollowWithLinks(resource);
    }

    if (this.isFollowUserDto(resource)) {
      return this.enhanceFollowUserWithLinks(resource);
    }

    return resource;
  }

  // TODO: BORRAR ESTO UNA VEZ QUE PAGINE TODOS LOS RESULTADOS QUE SON ARRAYS
  static enhanceResourcesWithLinks(resources: unknown[]): unknown[] {
    if (resources.length === 0) return resources;

    const sample = resources[0];

    if (this.isTweetDto(sample)) {
      return this.enhanceTweetsWithLinks(resources as TweetDto[]);
    }

    if (this.isUserDto(sample)) {
      return this.enhanceUsersWithLinks(resources as UserDto[]);
    }

    if (this.isFollowDto(sample)) {
      return this.enhanceFollowsWithLinks(resources as FollowDto[]);
    }

    if (this.isFollowUserDto(sample)) {
      return this.enhanceFollowUsersWithLinks(resources as FollowUserDto[]);
    }

    return resources;
  }
}
