import { Test, TestingModule } from '@nestjs/testing';
import { FollowRepositoryImpl } from '../../../../../../src/infrastructure/database/in-memory/repositories/follow.repository';
import { FollowAggregate } from '../../../../../../src/domain/aggregates/follow/follow.aggregate';

describe('FollowRepositoryImpl', () => {
  let repository: FollowRepositoryImpl;

  // Setup test module before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FollowRepositoryImpl],
    }).compile();

    repository = module.get<FollowRepositoryImpl>(FollowRepositoryImpl);
  });

  // Mock a follow aggregate for testing
  const createMockFollow = (
    id: string,
    followerId: string,
    followedId: string,
    createdAt: Date,
  ): FollowAggregate => {
    const followAggregate = {
      getId: jest.fn().mockReturnValue(id),
      getFollowerId: jest.fn().mockReturnValue(followerId),
      getFollowedId: jest.fn().mockReturnValue(followedId),
      getCreatedAt: jest.fn().mockReturnValue(createdAt),
    } as unknown as FollowAggregate;

    return followAggregate;
  };

  describe('create', () => {
    it('should create a follow relationship and make it accessible by ID', async () => {
      // Arrange
      const followId = 'follow-123';
      const followerId = 'follower-123';
      const followedId = 'followed-123';
      const createdAt = new Date();
      const follow = createMockFollow(
        followId,
        followerId,
        followedId,
        createdAt,
      );

      // Act
      await repository.create(follow);

      // Assert
      const foundById = await repository.findById(followId);
      expect(foundById).toBe(follow);
    });

    it('should make the follow relationship accessible by follower and followed', async () => {
      // Arrange
      const followId = 'follow-456';
      const followerId = 'follower-456';
      const followedId = 'followed-456';
      const createdAt = new Date();
      const follow = createMockFollow(
        followId,
        followerId,
        followedId,
        createdAt,
      );

      // Act
      await repository.create(follow);

      // Assert
      const foundByRelationship = await repository.findByFollowerAndFollowed(
        followerId,
        followedId,
      );
      expect(foundByRelationship).toBe(follow);
    });
  });

  describe('findById', () => {
    it('should return null for non-existent follow relationship', async () => {
      // Act
      const follow = await repository.findById('non-existent-id');

      // Assert
      expect(follow).toBeNull();
    });

    it('should return follow when found by ID', async () => {
      // Arrange
      const followId = 'follow-789';
      const followerId = 'follower-789';
      const followedId = 'followed-789';
      const createdAt = new Date();
      const follow = createMockFollow(
        followId,
        followerId,
        followedId,
        createdAt,
      );
      await repository.create(follow);

      // Act
      const foundFollow = await repository.findById(followId);

      // Assert
      expect(foundFollow).toBe(follow);
    });
  });

  describe('findByFollowerAndFollowed', () => {
    it('should return null when relationship does not exist', async () => {
      // Act
      const follow = await repository.findByFollowerAndFollowed(
        'non-existent',
        'also-non-existent',
      );

      // Assert
      expect(follow).toBeNull();
    });

    it('should return the follow relationship when it exists', async () => {
      // Arrange
      const followId = 'specific-follow';
      const followerId = 'specific-follower';
      const followedId = 'specific-followed';
      const createdAt = new Date();
      const follow = createMockFollow(
        followId,
        followerId,
        followedId,
        createdAt,
      );
      await repository.create(follow);

      // Act
      const foundFollow = await repository.findByFollowerAndFollowed(
        followerId,
        followedId,
      );

      // Assert
      expect(foundFollow).toBe(follow);
    });
  });

  describe('findFollowers', () => {
    it('should return empty array when user has no followers', async () => {
      // Act
      const followers = await repository.findFollowers('user-no-followers');

      // Assert
      expect(followers).toEqual([]);
    });

    it('should return all followers of a user', async () => {
      // Arrange
      const followedId = 'user-with-followers';

      // Create multiple followers
      const follow1 = createMockFollow(
        'follow-to-user-1',
        'follower-1',
        followedId,
        new Date(),
      );
      const follow2 = createMockFollow(
        'follow-to-user-2',
        'follower-2',
        followedId,
        new Date(),
      );
      const follow3 = createMockFollow(
        'follow-to-user-3',
        'follower-3',
        followedId,
        new Date(),
      );

      await repository.create(follow1);
      await repository.create(follow2);
      await repository.create(follow3);

      // Also create a follow relationship where the user is following someone else
      const otherFollow = createMockFollow(
        'other-follow',
        followedId,
        'someone-else',
        new Date(),
      );
      await repository.create(otherFollow);

      // Act
      const followers = await repository.findFollowers(followedId);

      // Assert
      expect(followers).toHaveLength(3);
      expect(followers).toContain(follow1);
      expect(followers).toContain(follow2);
      expect(followers).toContain(follow3);
      expect(followers).not.toContain(otherFollow);
    });
  });

  describe('findFollowing', () => {
    it('should return empty array when user is not following anyone', async () => {
      // Act
      const following = await repository.findFollowing('user-following-none');

      // Assert
      expect(following).toEqual([]);
    });

    it('should return all users a user is following', async () => {
      // Arrange
      const followerId = 'user-following-others';

      // Create multiple followings
      const follow1 = createMockFollow(
        'user-following-1',
        followerId,
        'followed-1',
        new Date(),
      );
      const follow2 = createMockFollow(
        'user-following-2',
        followerId,
        'followed-2',
        new Date(),
      );
      const follow3 = createMockFollow(
        'user-following-3',
        followerId,
        'followed-3',
        new Date(),
      );

      await repository.create(follow1);
      await repository.create(follow2);
      await repository.create(follow3);

      // Also create a follow relationship where someone is following this user
      const otherFollow = createMockFollow(
        'other-following',
        'someone-else',
        followerId,
        new Date(),
      );
      await repository.create(otherFollow);

      // Act
      const following = await repository.findFollowing(followerId);

      // Assert
      expect(following).toHaveLength(3);
      expect(following).toContain(follow1);
      expect(following).toContain(follow2);
      expect(following).toContain(follow3);
      expect(following).not.toContain(otherFollow);
    });
  });

  describe('isFollowing', () => {
    it('should return false when follow relationship does not exist', async () => {
      // Act
      const isFollowing = await repository.isFollowing(
        'non-existent',
        'also-non-existent',
      );

      // Assert
      expect(isFollowing).toBe(false);
    });

    it('should return true when follow relationship exists', async () => {
      // Arrange
      const followerId = 'check-follower';
      const followedId = 'check-followed';
      const follow = createMockFollow(
        'check-follow',
        followerId,
        followedId,
        new Date(),
      );
      await repository.create(follow);

      // Act
      const isFollowing = await repository.isFollowing(followerId, followedId);

      // Assert
      expect(isFollowing).toBe(true);
    });
  });

  describe('delete', () => {
    it('should do nothing when follow does not exist', async () => {
      // This should not throw an error
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });

    it('should delete the follow relationship and make it inaccessible', async () => {
      // Arrange
      const followId = 'follow-to-delete';
      const followerId = 'deleter';
      const followedId = 'deletee';
      const follow = createMockFollow(
        followId,
        followerId,
        followedId,
        new Date(),
      );
      await repository.create(follow);

      // Verify it exists first
      expect(await repository.findById(followId)).toBe(follow);
      expect(await repository.isFollowing(followerId, followedId)).toBe(true);

      // Act
      await repository.delete(followId);

      // Assert
      expect(await repository.findById(followId)).toBeNull();
      expect(await repository.isFollowing(followerId, followedId)).toBe(false);
      expect(await repository.findFollowers(followedId)).toEqual([]);
      expect(await repository.findFollowing(followerId)).toEqual([]);
    });

    it("should remove the relationship from user's followers and following lists", async () => {
      // Arrange
      const followId1 = 'follow-delete-1';
      const followId2 = 'follow-delete-2';
      const followerId = 'multi-deleter';
      const followedId1 = 'multi-deletee-1';
      const followedId2 = 'multi-deletee-2';

      const follow1 = createMockFollow(
        followId1,
        followerId,
        followedId1,
        new Date(),
      );
      const follow2 = createMockFollow(
        followId2,
        followerId,
        followedId2,
        new Date(),
      );

      await repository.create(follow1);
      await repository.create(follow2);

      // Verify initial state
      expect((await repository.findFollowing(followerId)).length).toBe(2);

      // Act
      await repository.delete(followId1);

      // Assert
      // Should only have one remaining follow
      const followingAfterDelete = await repository.findFollowing(followerId);
      expect(followingAfterDelete.length).toBe(1);
      expect(followingAfterDelete[0]).toBe(follow2);

      // Should not be following the first user anymore
      expect(await repository.isFollowing(followerId, followedId1)).toBe(false);
      // Should still be following the second user
      expect(await repository.isFollowing(followerId, followedId2)).toBe(true);
    });
  });
});
