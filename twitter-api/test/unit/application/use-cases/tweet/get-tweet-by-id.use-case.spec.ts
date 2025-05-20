import { Test, TestingModule } from '@nestjs/testing';
import { GetTweetByIdUseCase } from '../../../../../src/application/use-cases/tweet/get-tweets.use-case';
import { TWEET_SERVICE } from '../../../../../src/domain/interfaces/service/service.tokens';
import { TweetAggregate } from '../../../../../src/domain/aggregates/tweet/tweet.aggregate';
import { TweetDto } from '../../../../../src/application/dtos/tweet.dto';
import { TweetNotFoundException } from '../../../../../src/domain/exceptions/domain.exceptions';

// Mock the LinkGenerator just in case it is used in other files
jest.mock('../../../../../src/presentation/utils/link-generator', () => ({
  LinkGenerator: {
    enhanceTweetWithLinks: jest.fn((tweetDto: TweetDto) => tweetDto),
  },
}));

describe('GetTweetByIdUseCase', () => {
  let useCase: GetTweetByIdUseCase;

  // Mock services
  const mockTweetService = {
    getTweetById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTweetByIdUseCase,
        {
          provide: TWEET_SERVICE,
          useValue: mockTweetService,
        },
      ],
    }).compile();

    useCase = module.get<GetTweetByIdUseCase>(GetTweetByIdUseCase);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a tweet when found by ID', async () => {
      // Arrange
      const tweetId = 'tweet-123';
      const userId = 'user-456';
      const content = 'Test tweet content';
      const createdAt = new Date('2023-01-01');

      const mockTweet = {
        getId: () => tweetId,
        getUserId: () => userId,
        getContent: () => content,
        getCreatedAt: () => createdAt,
        toDTO: () => ({
          id: tweetId,
          userId: userId,
          content: content,
          createdAt: createdAt,
        }),
      } as unknown as TweetAggregate;

      mockTweetService.getTweetById.mockResolvedValue(mockTweet);

      // Act
      const result = await useCase.execute(tweetId);

      // Assert
      expect(mockTweetService.getTweetById).toHaveBeenCalledWith(tweetId);
      expect(result).toEqual({
        id: tweetId,
        userId: userId,
        content: content,
        createdAt: expect.any(Date) as Date,
      });
    });

    it('should throw TweetNotFoundException when tweet is not found', async () => {
      // Arrange
      const tweetId = 'non-existent-tweet';

      mockTweetService.getTweetById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(tweetId)).rejects.toThrow(
        TweetNotFoundException,
      );

      expect(mockTweetService.getTweetById).toHaveBeenCalledWith(tweetId);
    });
  });
});
