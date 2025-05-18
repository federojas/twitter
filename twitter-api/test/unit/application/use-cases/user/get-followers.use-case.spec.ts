import { Test, TestingModule } from '@nestjs/testing';
import { GetFollowersUseCase } from '../../../../../src/application/use-cases/user/get-followers.use-case';
import {
  FOLLOW_SERVICE,
  USER_SERVICE,
} from '../../../../../src/domain/interfaces/service/service.tokens';
import { FollowAggregate } from '../../../../../src/domain/aggregates/follow/follow.aggregate';
import { UserAggregate } from '../../../../../src/domain/aggregates/user/user.aggregate';
import { FollowUserDto } from '../../../../../src/application/dtos/follow.dto';
import { LinkGenerator } from '../../../../../src/application/utils/link-generator';
import { UserNotFoundException } from '../../../../../src/domain/exceptions/domain.exceptions';

// Mock the LinkGenerator
jest.mock('../../../../../src/application/utils/link-generator', () => ({
  LinkGenerator: {
    enhanceFollowUsersWithLinks: jest.fn((users: FollowUserDto[]) =>
      users.map((user) => ({
        ...user,
        links: {
          self: `/users/${user.id}`,
          followers: `/users/${user.id}/followers`,
          following: `/users/${user.id}/following`,
          tweets: `/users/${user.id}/tweets`,
        },
      })),
    ),
  },
}));

describe('GetFollowersUseCase', () => {
  let useCase: GetFollowersUseCase;

  // Mock services
  const mockFollowService = {
    getUserFollowers: jest.fn(),
    isFollowing: jest.fn(),
  };

  const mockUserService = {
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFollowersUseCase,
        {
          provide: FOLLOW_SERVICE,
          useValue: mockFollowService,
        },
        {
          provide: USER_SERVICE,
          useValue: mockUserService,
        },
      ],
    }).compile();

    useCase = module.get<GetFollowersUseCase>(GetFollowersUseCase);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a list of followers with enhanced links', async () => {
      // Arrange
      const userId = 'user-123';
      const followerId1 = 'follower-1';
      const followerId2 = 'follower-2';

      // Mock user and follow service responses
      const mockUser = {
        getId: () => userId,
        getUsername: () => 'testuser',
        getDisplayName: () => 'Test User',
      } as unknown as UserAggregate;

      const mockFollower1 = {
        getId: () => followerId1,
        getUsername: () => 'follower1',
        getDisplayName: () => 'Follower One',
      } as unknown as UserAggregate;

      const mockFollower2 = {
        getId: () => followerId2,
        getUsername: () => 'follower2',
        getDisplayName: () => 'Follower Two',
      } as unknown as UserAggregate;

      const mockFollows = [
        { getFollowerId: () => followerId1 },
        { getFollowerId: () => followerId2 },
      ] as unknown as FollowAggregate[];

      // Setup mock responses
      mockUserService.getUserById.mockImplementation((id) => {
        if (id === userId) return Promise.resolve(mockUser);
        if (id === followerId1) return Promise.resolve(mockFollower1);
        if (id === followerId2) return Promise.resolve(mockFollower2);
        return Promise.resolve(null);
      });

      mockFollowService.getUserFollowers.mockResolvedValue(mockFollows);
      mockFollowService.isFollowing.mockImplementation((id1, id2) => {
        // User is following follower1 but not follower2
        if (id1 === userId && id2 === followerId1) return Promise.resolve(true);
        return Promise.resolve(false);
      });

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFollowService.getUserFollowers).toHaveBeenCalledWith(userId);

      // Should have checked each follower
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId1);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId2);

      // Should have checked if user is following each follower
      expect(mockFollowService.isFollowing).toHaveBeenCalledWith(
        userId,
        followerId1,
      );
      expect(mockFollowService.isFollowing).toHaveBeenCalledWith(
        userId,
        followerId2,
      );

      expect(LinkGenerator.enhanceFollowUsersWithLinks).toHaveBeenCalled();

      // Verify the returned follower list
      expect(result.length).toBe(2);

      // Check first follower details
      expect(result[0].id).toBe(followerId1);
      expect(result[0].username).toBe('follower1');
      expect(result[0].displayName).toBe('Follower One');
      expect(result[0].following).toBe(true);
      expect(result[0].links).toBeDefined();

      // Check second follower details
      expect(result[1].id).toBe(followerId2);
      expect(result[1].username).toBe('follower2');
      expect(result[1].displayName).toBe('Follower Two');
      expect(result[1].following).toBe(false);
      expect(result[1].links).toBeDefined();
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-user';

      // Mock services to throw exception
      mockUserService.getUserById.mockRejectedValue(
        new UserNotFoundException(userId),
      );

      // Act & Assert
      await expect(useCase.execute(userId)).rejects.toThrow(
        UserNotFoundException,
      );

      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFollowService.getUserFollowers).not.toHaveBeenCalled();
    });

    it('should return empty array when user has no followers', async () => {
      // Arrange
      const userId = 'user-no-followers';

      // Mock user and follow service responses
      const mockUser = {
        getId: () => userId,
        getUsername: () => 'lonelyuser',
        getDisplayName: () => 'Lonely User',
      } as unknown as UserAggregate;

      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockFollowService.getUserFollowers.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFollowService.getUserFollowers).toHaveBeenCalledWith(userId);

      // Should have enhanced an empty array
      expect(LinkGenerator.enhanceFollowUsersWithLinks).toHaveBeenCalledWith(
        [],
      );

      // Verify the returned follower list is empty
      expect(result).toEqual([]);
    });

    it('should skip null followers', async () => {
      // Arrange
      const userId = 'user-123';
      const followerId = 'follower-1';
      const nonExistentFollowerId = 'non-existent-follower';

      // Mock user and follow service responses
      const mockUser = {
        getId: () => userId,
        getUsername: () => 'testuser',
        getDisplayName: () => 'Test User',
      } as unknown as UserAggregate;

      const mockFollower = {
        getId: () => followerId,
        getUsername: () => 'follower1',
        getDisplayName: () => 'Follower One',
      } as unknown as UserAggregate;

      const mockFollows = [
        { getFollowerId: () => followerId },
        { getFollowerId: () => nonExistentFollowerId },
      ] as unknown as FollowAggregate[];

      // Setup mock responses
      mockUserService.getUserById.mockImplementation((id) => {
        if (id === userId) return Promise.resolve(mockUser);
        if (id === followerId) return Promise.resolve(mockFollower);
        return Promise.resolve(null); // Return null for non-existent follower
      });

      mockFollowService.getUserFollowers.mockResolvedValue(mockFollows);
      mockFollowService.isFollowing.mockResolvedValue(false);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFollowService.getUserFollowers).toHaveBeenCalledWith(userId);

      // Should have checked each follower
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(
        nonExistentFollowerId,
      );

      // Only one valid follower should be returned
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(followerId);
    });
  });
});
