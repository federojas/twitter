import { FollowRepositoryImpl } from '../../../../../../src/infrastructure/database/in-memory/repositories/follow.repository';
import { FollowAggregate } from '../../../../../../src/domain/aggregates/follow/follow.aggregate';

describe('FollowRepositoryImpl', () => {
  let repository: FollowRepositoryImpl;
  let follows: FollowAggregate[];

  beforeEach(() => {
    repository = new FollowRepositoryImpl();
    follows = [];

    // Create some follow aggregates for testing
    for (let i = 1; i <= 3; i++) {
      follows.push({
        getId: () => `follow-${i}`,
        getFollowerId: () => `follower-${i}`,
        getFollowedId: () => `followed-${i}`,
      } as unknown as FollowAggregate);
    }

    // Add same follower for multiple users
    follows.push({
      getId: () => 'follow-4',
      getFollowerId: () => 'follower-1',
      getFollowedId: () => 'followed-4',
    } as unknown as FollowAggregate);

    // Add multiple followers for same user
    follows.push({
      getId: () => 'follow-5',
      getFollowerId: () => 'follower-2',
      getFollowedId: () => 'followed-1',
    } as unknown as FollowAggregate);
  });

  describe('create', () => {
    it('should add a follow to the repository', async () => {
      // Arrange
      const follow = follows[0];

      // Act
      await repository.create(follow);

      // Assert
      const result = await repository.findById(follow.getId());
      expect(result).toBe(follow);
    });
  });

  describe('findById', () => {
    it('should return a follow when it exists', async () => {
      // Arrange
      const follow = follows[0];
      await repository.create(follow);

      // Act
      const result = await repository.findById(follow.getId());

      // Assert
      expect(result).toBe(follow);
    });

    it('should return null when follow does not exist', async () => {
      // Act
      const result = await repository.findById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByFollowerAndFollowed', () => {
    it('should return a follow when the relationship exists', async () => {
      // Arrange
      const follow = follows[0];
      await repository.create(follow);

      // Act
      const result = await repository.findByFollowerAndFollowed(
        follow.getFollowerId(),
        follow.getFollowedId(),
      );

      // Assert
      expect(result).toBe(follow);
    });

    it('should return null when the relationship does not exist', async () => {
      // Act
      const result = await repository.findByFollowerAndFollowed(
        'non-existent-follower',
        'non-existent-followed',
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findFollowers', () => {
    it('should return paginated followers for a user', async () => {
      // Arrange
      // Create follows: both follower-1 and follower-2 follow followed-1
      await repository.create(follows[0]); // follower-1 follows followed-1
      await repository.create(follows[4]); // follower-2 follows followed-1

      // Act - Get first page with 1 follower per page
      const result = await repository.findFollowers('followed-1', 1, 1);

      // Assert
      expect(result.length).toBe(1);
      // Note: The order in which followers are returned is not guaranteed,
      // so we're just checking that one of the two followers is returned
      expect(['follower-1', 'follower-2']).toContain(result[0].getFollowerId());
    });

    it('should return second page of followers', async () => {
      // Arrange
      // Create follows: both follower-1 and follower-2 follow followed-1
      await repository.create(follows[0]); // follower-1 follows followed-1
      await repository.create(follows[4]); // follower-2 follows followed-1

      // Act - Get second page with 1 follower per page
      const result = await repository.findFollowers('followed-1', 2, 1);

      // Assert
      expect(result.length).toBe(1);
      // Note: The order in which followers are returned is not guaranteed,
      // so we're checking for one of the followers that wasn't on the first page
      expect(['follower-1', 'follower-2']).toContain(result[0].getFollowerId());
    });

    it('should return empty array when user has no followers', async () => {
      // Act
      const result = await repository.findFollowers('user-with-no-followers');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findFollowing', () => {
    it('should return paginated following for a user', async () => {
      // Arrange
      // Create follows: follower-1 follows both followed-1 and followed-4
      await repository.create(follows[0]); // follower-1 follows followed-1
      await repository.create(follows[3]); // follower-1 follows followed-4

      // Act - Get first page with 1 followed user per page
      const result = await repository.findFollowing('follower-1', 1, 1);

      // Assert
      expect(result.length).toBe(1);
      // Note: The order in which followed users are returned is not guaranteed
      expect(['followed-1', 'followed-4']).toContain(result[0].getFollowedId());
    });

    it('should return second page of following', async () => {
      // Arrange
      // Create follows: follower-1 follows both followed-1 and followed-4
      await repository.create(follows[0]); // follower-1 follows followed-1
      await repository.create(follows[3]); // follower-1 follows followed-4

      // Act - Get second page with 1 followed user per page
      const result = await repository.findFollowing('follower-1', 2, 1);

      // Assert
      expect(result.length).toBe(1);
      // Note: The order in which followed users are returned is not guaranteed
      expect(['followed-1', 'followed-4']).toContain(result[0].getFollowedId());
    });

    it('should return empty array when user is not following anyone', async () => {
      // Act
      const result = await repository.findFollowing('user-following-no-one');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findAllFollowing', () => {
    it('should return all users followed by a specific user', async () => {
      // Arrange
      // Create follows: follower-1 follows both followed-1 and followed-4
      await repository.create(follows[0]); // follower-1 follows followed-1
      await repository.create(follows[3]); // follower-1 follows followed-4

      // Act
      const result = await repository.findAllFollowing('follower-1');

      // Assert
      expect(result.length).toBe(2);
      const followedIds = result.map((follow) => follow.getFollowedId());
      expect(followedIds).toContain('followed-1');
      expect(followedIds).toContain('followed-4');
    });

    it('should return empty array when user is not following anyone', async () => {
      // Act
      const result = await repository.findAllFollowing('user-following-no-one');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findAllFollowers', () => {
    it('should return all followers of a specific user', async () => {
      // Arrange
      // Create follows: both follower-1 and follower-2 follow followed-1
      await repository.create(follows[0]); // follower-1 follows followed-1
      await repository.create(follows[4]); // follower-2 follows followed-1

      // Act
      const result = await repository.findAllFollowers('followed-1');

      // Assert
      expect(result.length).toBe(2);
      const followerIds = result.map((follow) => follow.getFollowerId());
      expect(followerIds).toContain('follower-1');
      expect(followerIds).toContain('follower-2');
    });

    it('should return empty array when user has no followers', async () => {
      // Act
      const result = await repository.findAllFollowers(
        'user-with-no-followers',
      );

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('isFollowing', () => {
    it('should return true when follow relationship exists', async () => {
      // Arrange
      const follow = follows[0];
      await repository.create(follow);

      // Act
      const result = await repository.isFollowing(
        follow.getFollowerId(),
        follow.getFollowedId(),
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when follow relationship does not exist', async () => {
      // Act
      const result = await repository.isFollowing(
        'non-existent-follower',
        'non-existent-followed',
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a follow from the repository', async () => {
      // Arrange
      const follow = follows[0];
      await repository.create(follow);

      // Act
      await repository.delete(follow.getId());

      // Assert
      const result = await repository.findById(follow.getId());
      expect(result).toBeNull();

      // Also verify the relationship is removed from other lookup structures
      const relationship = await repository.findByFollowerAndFollowed(
        follow.getFollowerId(),
        follow.getFollowedId(),
      );
      expect(relationship).toBeNull();

      const isStillFollowing = await repository.isFollowing(
        follow.getFollowerId(),
        follow.getFollowedId(),
      );
      expect(isStillFollowing).toBe(false);
    });

    it('should not throw error when deleting non-existent follow', async () => {
      // Act & Assert
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });

    it('should remove follow relationship from follower indices', async () => {
      // Arrange
      const follow = follows[0]; // follower-1 follows followed-1
      await repository.create(follow);

      // Verify follower has following before delete
      let following = await repository.findFollowing(follow.getFollowerId());
      expect(following.length).toBe(1);

      // Act
      await repository.delete(follow.getId());

      // Assert - Following should be empty now
      following = await repository.findFollowing(follow.getFollowerId());
      expect(following.length).toBe(0);
    });

    it('should remove follow relationship from followed indices', async () => {
      // Arrange
      const follow = follows[0]; // follower-1 follows followed-1
      await repository.create(follow);

      // Verify followed user has followers before delete
      let followers = await repository.findFollowers(follow.getFollowedId());
      expect(followers.length).toBe(1);

      // Act
      await repository.delete(follow.getId());

      // Assert - Followers should be empty now
      followers = await repository.findFollowers(follow.getFollowedId());
      expect(followers.length).toBe(0);
    });
  });
});
