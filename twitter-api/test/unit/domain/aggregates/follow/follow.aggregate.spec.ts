import { FollowAggregate } from '../../../../../src/domain/aggregates/follow/follow.aggregate';
import { ValidationException } from '../../../../../src/domain/exceptions/domain.exceptions';

describe('FollowAggregate', () => {
  describe('create', () => {
    it('should create a follow relationship with valid data', () => {
      // Arrange
      const followerId = 'follower-123';
      const followedId = 'followed-456';

      // Act
      const follow = FollowAggregate.create(followerId, followedId);

      // Assert
      expect(follow.getFollowerId()).toBe(followerId);
      expect(follow.getFollowedId()).toBe(followedId);
      expect(follow.getId()).toBeDefined();
      expect(follow.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should throw ValidationException if user tries to follow themselves', () => {
      // Arrange
      const userId = 'user-123';

      // Act & Assert
      expect(() => FollowAggregate.create(userId, userId)).toThrow(
        ValidationException,
      );
      expect(() => FollowAggregate.create(userId, userId)).toThrow(
        'Users cannot follow themselves',
      );
    });
  });

  describe('toDTO', () => {
    it('should return a proper DTO with all properties', () => {
      // Arrange
      const followerId = 'follower-789';
      const followedId = 'followed-012';
      const follow = FollowAggregate.create(followerId, followedId);

      // Act
      const dto = follow.toDTO();

      // Assert
      expect(dto).toEqual({
        id: follow.getId(),
        followerId: followerId,
        followedId: followedId,
        createdAt: expect.any(String) as string,
      });

      // Verify the date is a valid ISO string
      expect(() => new Date(dto.createdAt)).not.toThrow();
    });
  });

  describe('getters', () => {
    it('should return the correct values', () => {
      // Arrange
      const followerId = 'follower-345';
      const followedId = 'followed-678';
      const follow = FollowAggregate.create(followerId, followedId);

      // Act & Assert
      expect(follow.getFollowerId()).toBe(followerId);
      expect(follow.getFollowedId()).toBe(followedId);
      expect(follow.getId()).toBeDefined();

      // Verify getCreatedAt returns a clone of the date
      const createdAt1 = follow.getCreatedAt();
      const createdAt2 = follow.getCreatedAt();
      expect(createdAt1).toEqual(createdAt2);
      expect(createdAt1).not.toBe(createdAt2); // Different objects (clone)
    });
  });
});
