import { Test, TestingModule } from '@nestjs/testing';
import { CreateTweetUseCase } from '../../../../../src/application/use-cases/tweet/create-tweet.use-case';
import {
  TWEET_SERVICE,
  USER_SERVICE,
} from '../../../../../src/domain/interfaces/service/service.tokens';
import { TweetAggregate } from '../../../../../src/domain/aggregates/tweet/tweet.aggregate';
import {
  CreateTweetDto,
  TweetDto,
} from '../../../../../src/application/dtos/tweet.dto';
import { UserNotFoundException } from '../../../../../src/domain/exceptions/domain.exceptions';
import { LinkGenerator } from '../../../../../src/application/utils/link-generator';
import { UserAggregate } from '../../../../../src/domain/aggregates/user/user.aggregate';

// Mock the LinkGenerator utility
jest.mock('../../../../../src/application/utils/link-generator', () => ({
  LinkGenerator: {
    enhanceTweetWithLinks: jest.fn(
      (tweetDto: TweetDto): TweetDto & { _links: any } => ({
        ...tweetDto,
        _links: {
          self: { href: `/tweets/${tweetDto.id}` },
          user: { href: `/users/${tweetDto.userId}` },
        },
      }),
    ),
  },
}));

describe('CreateTweetUseCase', () => {
  let useCase: CreateTweetUseCase;

  // Mock services
  const mockTweetService = {
    createTweet: jest.fn(),
  };

  const mockUserService = {
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTweetUseCase,
        {
          provide: TWEET_SERVICE,
          useValue: mockTweetService,
        },
        {
          provide: USER_SERVICE,
          useValue: mockUserService,
        },
      ],
    }).compile();

    useCase = module.get<CreateTweetUseCase>(CreateTweetUseCase);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a tweet successfully when user exists', async () => {
      // Arrange
      const userId = 'test-user-id';
      const createTweetDto: CreateTweetDto = {
        content: 'This is a test tweet',
      };

      // Mock the user service to return a user
      const mockUser = {
        getId: () => userId,
      } as unknown as UserAggregate;
      mockUserService.getUserById.mockResolvedValue(mockUser);

      // Spy on TweetAggregate.create
      const createSpy = jest.spyOn(TweetAggregate, 'create');
      const mockTweet = {
        getId: () => 'tweet-123',
        getUserId: () => userId,
        getContent: () => createTweetDto.content,
        getCreatedAt: () => new Date(),
        toDTO: () => ({
          id: 'tweet-123',
          userId: userId,
          content: createTweetDto.content,
          createdAt: new Date(),
        }),
      } as unknown as TweetAggregate;
      createSpy.mockReturnValue(mockTweet);

      // Act
      const result = await useCase.execute(userId, createTweetDto);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(createSpy).toHaveBeenCalledWith(createTweetDto.content, userId);
      expect(mockTweetService.createTweet).toHaveBeenCalledWith(mockTweet);

      // Verify the returned DTO has the expected properties
      expect(result).toEqual({
        id: 'tweet-123',
        userId: userId as string,
        content: createTweetDto.content,
        createdAt: expect.any(Date) as Date,
        _links: {
          self: { href: `/tweets/tweet-123` },
          user: { href: `/users/${userId}` },
        },
      });

      // Verify LinkGenerator was called
      expect(LinkGenerator.enhanceTweetWithLinks).toHaveBeenCalled();
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const createTweetDto: CreateTweetDto = {
        content: 'This tweet should not be created',
      };

      // Mock user service to throw UserNotFoundException
      mockUserService.getUserById.mockRejectedValue(
        new UserNotFoundException(userId),
      );

      // Act & Assert
      await expect(useCase.execute(userId, createTweetDto)).rejects.toThrow(
        UserNotFoundException,
      );

      // Verify service was called but tweet never created
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockTweetService.createTweet).not.toHaveBeenCalled();
    });
  });
});
