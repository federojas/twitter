import { Test, TestingModule } from '@nestjs/testing';
import { GetTimelineUseCase } from '../../../../../src/application/use-cases/tweet/get-timeline.use-case';
import {
  FOLLOW_SERVICE,
  TWEET_SERVICE,
  USER_SERVICE,
} from '../../../../../src/domain/interfaces/service/service.tokens';
import { TweetAggregate } from '../../../../../src/domain/aggregates/tweet/tweet.aggregate';
import { FollowAggregate } from '../../../../../src/domain/aggregates/follow/follow.aggregate';
import { TweetDto } from '../../../../../src/application/dtos/tweet.dto';
import {
  PaginatedResult,
  PaginationParams,
} from '../../../../../src/application/dtos/pagination.dto';
import { UserAggregate } from '../../../../../src/domain/aggregates/user/user.aggregate';

// Mock the LinkGenerator
const mockEnhanceTweetsWithLinks = jest
  .fn()
  .mockImplementation((tweets: TweetDto[]) => tweets);
const mockGeneratePaginationLinks = jest.fn();
jest.mock('../../../../../src/presentation/utils/link-generator', () => ({
  LinkGenerator: {
    enhanceTweetsWithLinks: mockEnhanceTweetsWithLinks,
    generatePaginationLinks: mockGeneratePaginationLinks,
  },
}));

describe('GetTimelineUseCase', () => {
  let useCase: GetTimelineUseCase;

  // Mock services
  const mockUserService = {
    getUserById: jest.fn(),
  };

  const mockTweetService = {
    getTimelineTweets: jest.fn(),
    getTotalTimelineTweets: jest.fn(),
  };

  const mockFollowService = {
    getUserFollowing: jest.fn(),
    getAllUserFollowing: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTimelineUseCase,
        {
          provide: USER_SERVICE,
          useValue: mockUserService,
        },
        {
          provide: TWEET_SERVICE,
          useValue: mockTweetService,
        },
        {
          provide: FOLLOW_SERVICE,
          useValue: mockFollowService,
        },
      ],
    }).compile();

    useCase = module.get<GetTimelineUseCase>(GetTimelineUseCase);

    // Reset mocks before each test
    jest.clearAllMocks();
    mockEnhanceTweetsWithLinks.mockClear();
    mockGeneratePaginationLinks.mockClear();
  });

  describe('execute', () => {
    it('should return paginated timeline tweets', async () => {
      // Arrange
      const userId = 'user-123';
      const pagination = new PaginationParams(1, 10);

      // Mock user
      const mockUser = {
        getId: () => userId,
      } as unknown as UserAggregate;
      mockUserService.getUserById.mockResolvedValue(mockUser);

      // Mock follows
      const followedUser1 = 'followed-456';
      const followedUser2 = 'followed-789';
      const mockFollows = [
        {
          getFollowedId: () => followedUser1,
        },
        {
          getFollowedId: () => followedUser2,
        },
      ] as unknown as FollowAggregate[];
      mockFollowService.getAllUserFollowing.mockResolvedValue(mockFollows);

      // Mock tweets
      const mockTweets = [
        {
          getId: () => 'tweet-1',
          getUserId: () => userId,
          getContent: () => 'User tweet',
          getCreatedAt: () => new Date('2023-01-15'),
          toDTO: () => ({
            id: 'tweet-1',
            userId: userId,
            content: 'User tweet',
            createdAt: new Date('2023-01-15'),
          }),
        },
        {
          getId: () => 'tweet-2',
          getUserId: () => followedUser1,
          getContent: () => 'Followed user 1 tweet',
          getCreatedAt: () => new Date('2023-01-20'),
          toDTO: () => ({
            id: 'tweet-2',
            userId: followedUser1,
            content: 'Followed user 1 tweet',
            createdAt: new Date('2023-01-20'),
          }),
        },
      ] as unknown as TweetAggregate[];

      mockTweetService.getTimelineTweets.mockResolvedValue(mockTweets);
      mockTweetService.getTotalTimelineTweets.mockResolvedValue(5); // Total of 5 tweets

      // Act
      const result = await useCase.execute(userId, pagination);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFollowService.getAllUserFollowing).toHaveBeenCalledWith(
        userId,
      );

      expect(mockTweetService.getTimelineTweets).toHaveBeenCalledWith(
        userId,
        [followedUser1, followedUser2],
        pagination.page,
        pagination.pageSize,
      );

      expect(mockTweetService.getTotalTimelineTweets).toHaveBeenCalledWith(
        userId,
        [followedUser1, followedUser2],
      );

      // LinkGenerator is not used in the implementation
      expect(mockEnhanceTweetsWithLinks).not.toHaveBeenCalled();

      // Verify the returned paginated result
      expect(result).toBeInstanceOf(PaginatedResult);
      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
      expect(result.pagination.pageCount).toBe(1);

      // Check basic tweet data
      expect(result.data[0].id).toBe('tweet-1');
      expect(result.data[1].id).toBe('tweet-2');
    });

    it('should return empty array when user has no timeline', async () => {
      // Arrange
      const userId = 'user-no-timeline';
      const pagination = new PaginationParams(1, 10);

      // Mock user
      const mockUser = {
        getId: () => userId,
      } as unknown as UserAggregate;
      mockUserService.getUserById.mockResolvedValue(mockUser);

      // No follows
      mockFollowService.getAllUserFollowing.mockResolvedValue([]);

      // No tweets
      mockTweetService.getTimelineTweets.mockResolvedValue([]);
      mockTweetService.getTotalTimelineTweets.mockResolvedValue(0);

      // Act
      const result = await useCase.execute(userId, pagination);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFollowService.getAllUserFollowing).toHaveBeenCalledWith(
        userId,
      );
      expect(mockTweetService.getTimelineTweets).toHaveBeenCalledWith(
        userId,
        [],
        pagination.page,
        pagination.pageSize,
      );
      expect(mockTweetService.getTotalTimelineTweets).toHaveBeenCalledWith(
        userId,
        [],
      );

      // Verify the returned paginated result is empty
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should use default pagination if none provided', async () => {
      // Arrange
      const userId = 'user-123';

      // Mock user
      const mockUser = {
        getId: () => userId,
      } as unknown as UserAggregate;
      mockUserService.getUserById.mockResolvedValue(mockUser);

      // No follows
      mockFollowService.getAllUserFollowing.mockResolvedValue([]);

      // No tweets
      mockTweetService.getTimelineTweets.mockResolvedValue([]);
      mockTweetService.getTotalTimelineTweets.mockResolvedValue(0);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      // Default pagination should be PaginationParams defaults
      const defaultPagination = new PaginationParams();
      expect(mockTweetService.getTimelineTweets).toHaveBeenCalledWith(
        userId,
        [],
        defaultPagination.page,
        defaultPagination.pageSize,
      );

      // Verify the returned paginated result uses default pagination
      expect(result.pagination.page).toBe(defaultPagination.page);
      expect(result.pagination.pageSize).toBe(defaultPagination.pageSize);
    });
  });
});
