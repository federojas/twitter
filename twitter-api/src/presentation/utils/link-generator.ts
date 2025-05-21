import { TweetDto } from '../../application/dtos/tweet.dto';
import { UserDto } from '../../application/dtos/user.dto';
import { FollowDto } from '../../application/dtos/follow.dto';
import {
  isTweetDto,
  isUserDto,
  isFollowDto,
} from '../../application/utils/dto-type-guards';

type ResourceLinks = Record<string, string>;

export type ApiResource = TweetDto | UserDto | FollowDto;

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

  static enhanceTweetWithLinks(tweet: TweetDto): TweetDto {
    return this.enhanceWithLinks(tweet, (t) => this.getTweetLinks(t));
  }

  static enhanceUserWithLinks(user: UserDto): UserDto {
    return this.enhanceWithLinks(user, (u) => this.getUserLinks(u));
  }

  static enhanceFollowWithLinks(follow: FollowDto): FollowDto {
    return this.enhanceWithLinks(follow, (f) => this.getFollowLinks(f));
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

  static enhanceResourceWithLinks(resource: unknown): unknown {
    if (!resource || typeof resource !== 'object') return resource;

    if (isTweetDto(resource)) {
      return this.enhanceTweetWithLinks(resource);
    }

    if (isUserDto(resource)) {
      return this.enhanceUserWithLinks(resource);
    }

    if (isFollowDto(resource)) {
      return this.enhanceFollowWithLinks(resource);
    }

    return resource;
  }

  static enhanceResourcesWithLinks(resources: unknown[]): unknown[] {
    if (resources.length === 0) return resources;

    const sample = resources[0];

    if (isTweetDto(sample)) {
      return this.enhanceTweetsWithLinks(resources as TweetDto[]);
    }

    if (isUserDto(sample)) {
      return this.enhanceUsersWithLinks(resources as UserDto[]);
    }

    if (isFollowDto(sample)) {
      return this.enhanceFollowsWithLinks(resources as FollowDto[]);
    }

    return resources;
  }
}
