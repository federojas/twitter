import { TweetAggregate } from '../../../../../src/domain/aggregates/tweet/tweet.aggregate';
import {
  NotEmptyException,
  ValidationException,
} from '../../../../../src/domain/exceptions/domain.exceptions';

describe('TweetAggregate', () => {
  describe('create', () => {
    it('should create a tweet with valid data', () => {
      // Arrange
      const content = 'Hello, this is a valid tweet';
      const userId = 'user-123';

      // Act
      const tweet = TweetAggregate.create(content, userId);

      // Assert
      expect(tweet.getContent()).toBe(content);
      expect(tweet.getUserId()).toBe(userId);
      expect(tweet.getId()).toBeDefined();
      expect(tweet.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should throw NotEmptyException if content is empty', () => {
      // Arrange
      const userId = 'user-123';

      // Act & Assert
      expect(() => TweetAggregate.create('', userId)).toThrow(
        NotEmptyException,
      );
      expect(() => TweetAggregate.create('  ', userId)).toThrow(
        NotEmptyException,
      );
    });

    it('should throw ValidationException if content exceeds max length', () => {
      // Arrange
      const userId = 'user-123';
      const longContent = 'A'.repeat(TweetAggregate.MAX_TWEET_LENGTH + 1);

      // Act & Assert
      expect(() => TweetAggregate.create(longContent, userId)).toThrow(
        ValidationException,
      );
      expect(() => TweetAggregate.create(longContent, userId)).toThrow(
        `Tweet content cannot exceed ${TweetAggregate.MAX_TWEET_LENGTH} characters`,
      );
    });
  });

  describe('toDTO', () => {
    it('should return a proper DTO with all properties', () => {
      // Arrange
      const content = 'Test tweet for DTO conversion';
      const userId = 'user-456';
      const tweet = TweetAggregate.create(content, userId);

      // Act
      const dto = tweet.toDTO();

      // Assert
      expect(dto).toEqual({
        id: tweet.getId(),
        content: content,
        userId: userId,
        createdAt: expect.any(String) as string,
      });

      // Verify the date is a valid ISO string
      expect(() => new Date(dto.createdAt)).not.toThrow();
    });
  });

  describe('getters', () => {
    it('should return the correct values', () => {
      // Arrange
      const content = 'Tweet with getters';
      const userId = 'user-789';
      const tweet = TweetAggregate.create(content, userId);

      // Act & Assert
      expect(tweet.getContent()).toBe(content);
      expect(tweet.getUserId()).toBe(userId);
      expect(tweet.getId()).toBeDefined();

      // Verify getCreatedAt returns a clone of the date
      const createdAt1 = tweet.getCreatedAt();
      const createdAt2 = tweet.getCreatedAt();
      expect(createdAt1).toEqual(createdAt2);
      expect(createdAt1).not.toBe(createdAt2); // Different objects (clone)
    });
  });
});
