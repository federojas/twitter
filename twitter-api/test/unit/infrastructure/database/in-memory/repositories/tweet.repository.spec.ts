import { Test, TestingModule } from '@nestjs/testing';
import { TweetRepositoryImpl } from '../../../../../../src/infrastructure/database/in-memory/repositories/tweet.repository';
import { TweetAggregate } from '../../../../../../src/domain/aggregates/tweet/tweet.aggregate';

describe('TweetRepositoryImpl', () => {
  let repository: TweetRepositoryImpl;

  // Setup test module before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TweetRepositoryImpl],
    }).compile();

    repository = module.get<TweetRepositoryImpl>(TweetRepositoryImpl);
  });

  // Mock a tweet aggregate for testing
  const createMockTweet = (
    id: string,
    userId: string,
    content: string,
    createdAt: Date,
  ): TweetAggregate => {
    const tweetAggregate = {
      getId: jest.fn().mockReturnValue(id),
      getUserId: jest.fn().mockReturnValue(userId),
      getContent: jest.fn().mockReturnValue(content),
      getCreatedAt: jest.fn().mockReturnValue(createdAt),
    } as unknown as TweetAggregate;

    return tweetAggregate;
  };

  describe('create', () => {
    it('should create a tweet and store it by ID and userId', async () => {
      // Arrange
      const tweetId = 'tweet-123';
      const userId = 'user-123';
      const content = 'Hello World!';
      const createdAt = new Date();
      const tweet = createMockTweet(tweetId, userId, content, createdAt);

      // Act
      await repository.create(tweet);

      // Assert
      const foundById = await repository.findById(tweetId);
      const foundByUserId = await repository.findByUserId(userId);

      expect(foundById).toBe(tweet);
      expect(foundByUserId).toContain(tweet);
      expect(foundByUserId).toHaveLength(1);
    });

    it('should add multiple tweets to a user and store them in chronological order (newest first)', async () => {
      // Arrange
      const userId = 'user-multi-tweets';

      // Create tweets with clearly different timestamps
      const oldestDate = new Date(2023, 0, 1); // January 1, 2023
      const middleDate = new Date(2023, 0, 2); // January 2, 2023
      const newestDate = new Date(2023, 0, 3); // January 3, 2023

      // Define tweets with IDs that match their chronological order
      const oldest = createMockTweet(
        'tweet-oldest',
        userId,
        'Oldest tweet',
        oldestDate,
      );

      const middle = createMockTweet(
        'tweet-middle',
        userId,
        'Middle tweet',
        middleDate,
      );

      const newest = createMockTweet(
        'tweet-newest',
        userId,
        'Newest tweet',
        newestDate,
      );

      // Act - add tweets in random order
      await repository.create(middle); // Add middle first
      await repository.create(oldest); // Add oldest second
      await repository.create(newest); // Add newest last

      // Assert
      const userTweets = await repository.findByUserId(userId);
      expect(userTweets).toHaveLength(3);

      // Check ordering - repository should always return newest first
      // The repository uses unshift() which adds items to the beginning of the array
      expect(userTweets[0].getId()).toEqual('tweet-newest');
      expect(userTweets[1].getId()).toEqual('tweet-oldest');
      expect(userTweets[2].getId()).toEqual('tweet-middle');
    });
  });

  describe('findById', () => {
    it('should return null for non-existent tweet', async () => {
      // Act
      const tweet = await repository.findById('non-existent-id');

      // Assert
      expect(tweet).toBeNull();
    });

    it('should return tweet when found by ID', async () => {
      // Arrange
      const tweetId = 'tweet-456';
      const userId = 'user-456';
      const content = 'Another tweet';
      const createdAt = new Date();
      const tweet = createMockTweet(tweetId, userId, content, createdAt);
      await repository.create(tweet);

      // Act
      const foundTweet = await repository.findById(tweetId);

      // Assert
      expect(foundTweet).toBe(tweet);
    });
  });

  describe('findByUserId', () => {
    it('should return empty array for user with no tweets', async () => {
      // Act
      const tweets = await repository.findByUserId('user-no-tweets');

      // Assert
      expect(tweets).toEqual([]);
    });

    it('should return all tweets for a user', async () => {
      // Arrange
      const userId = 'user-with-tweets';
      const tweet1 = createMockTweet(
        'tweet-user-1',
        userId,
        'User tweet 1',
        new Date(),
      );
      const tweet2 = createMockTweet(
        'tweet-user-2',
        userId,
        'User tweet 2',
        new Date(),
      );
      await repository.create(tweet1);
      await repository.create(tweet2);

      // Also create a tweet from another user to verify filtering
      const otherUserId = 'other-user';
      const otherTweet = createMockTweet(
        'tweet-other',
        otherUserId,
        'Other user tweet',
        new Date(),
      );
      await repository.create(otherTweet);

      // Act
      const userTweets = await repository.findByUserId(userId);

      // Assert
      expect(userTweets).toHaveLength(2);
      expect(userTweets).toContain(tweet1);
      expect(userTweets).toContain(tweet2);
      expect(userTweets).not.toContain(otherTweet);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no tweets exist', async () => {
      // Act
      const tweets = await repository.findAll();

      // Assert
      expect(tweets).toEqual([]);
    });

    it('should return all tweets', async () => {
      // Arrange
      const tweet1 = createMockTweet(
        'global-tweet-1',
        'user-a',
        'Global tweet 1',
        new Date(),
      );
      const tweet2 = createMockTweet(
        'global-tweet-2',
        'user-b',
        'Global tweet 2',
        new Date(),
      );
      const tweet3 = createMockTweet(
        'global-tweet-3',
        'user-a',
        'Global tweet 3',
        new Date(),
      );
      await repository.create(tweet1);
      await repository.create(tweet2);
      await repository.create(tweet3);

      // Act
      const allTweets = await repository.findAll();

      // Assert
      expect(allTweets).toHaveLength(3);
      expect(allTweets).toContain(tweet1);
      expect(allTweets).toContain(tweet2);
      expect(allTweets).toContain(tweet3);
    });
  });
});
