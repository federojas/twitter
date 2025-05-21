import { Test, TestingModule } from '@nestjs/testing';
import { GetFollowingUseCase } from '../../../../../src/application/use-cases/user/get-following.use-case';
import {
  FOLLOW_SERVICE,
  USER_SERVICE,
} from '../../../../../src/domain/interfaces/service/service.tokens';
import { FollowAggregate } from '../../../../../src/domain/aggregates/follow/follow.aggregate';
import { UserAggregate } from '../../../../../src/domain/aggregates/user/user.aggregate';
import { UserNotFoundException } from '../../../../../src/domain/exceptions/domain.exceptions';
import { UserDto } from '../../../../../src/application/dtos/user.dto';

// Mock the LinkGenerator
const mockEnhanceFollowUsersWithLinks = jest.fn();
jest.mock('../../../../../src/presentation/utils/link-generator', () => ({
  LinkGenerator: {
    enhanceFollowUsersWithLinks:
      mockEnhanceFollowUsersWithLinks.mockImplementation(
        (users: UserDto[]) => users,
      ),
  },
}));

describe('GetFollowingUseCase', () => {
  let useCase: GetFollowingUseCase;

  // Mock services
  const mockFollowService = {
    getUserFollowing: jest.fn(),
    getTotalFollowing: jest.fn(),
  };

  const mockUserService = {
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFollowingUseCase,
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

    useCase = module.get<GetFollowingUseCase>(GetFollowingUseCase);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a list of followed users', async () => {
      // Arrange
      const userId = 'user-123';
      const followedId1 = 'followed-1';
      const followedId2 = 'followed-2';

      // Mock user and follow service responses
      const mockUser = {
        getId: () => userId,
        getUsername: () => 'testuser',
        getDisplayName: () => 'Test User',
        getCreatedAt: () => new Date('2023-01-01'),
      } as unknown as UserAggregate;

      const mockFollowed1 = {
        getId: () => followedId1,
        getUsername: () => 'followed1',
        getDisplayName: () => 'Followed One',
        getCreatedAt: () => new Date('2023-01-01'),
      } as unknown as UserAggregate;

      const mockFollowed2 = {
        getId: () => followedId2,
        getUsername: () => 'followed2',
        getDisplayName: () => 'Followed Two',
        getCreatedAt: () => new Date('2023-01-01'),
      } as unknown as UserAggregate;

      const mockFollows = [
        { getFollowedId: () => followedId1 },
        { getFollowedId: () => followedId2 },
      ] as unknown as FollowAggregate[];

      // Setup mock responses
      mockUserService.getUserById.mockImplementation((id) => {
        if (id === userId) return Promise.resolve(mockUser);
        if (id === followedId1) return Promise.resolve(mockFollowed1);
        if (id === followedId2) return Promise.resolve(mockFollowed2);
        return Promise.resolve(null);
      });

      mockFollowService.getUserFollowing.mockResolvedValue(mockFollows);
      mockFollowService.getTotalFollowing.mockResolvedValue(2);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFollowService.getUserFollowing).toHaveBeenCalledWith(
        userId,
        1,
        10,
      );

      // Should have checked each followed user
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followedId1);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followedId2);

      // Verify the returned following list
      expect(result.data.length).toBe(2);

      // Check first followed user details
      expect(result.data[0].id).toBe(followedId1);
      expect(result.data[0].username).toBe('followed1');
      expect(result.data[0].displayName).toBe('Followed One');
      expect(result.data[0].createdAt).toEqual(new Date('2023-01-01'));

      // Check second followed user details
      expect(result.data[1].id).toBe(followedId2);
      expect(result.data[1].username).toBe('followed2');
      expect(result.data[1].displayName).toBe('Followed Two');
      expect(result.data[1].createdAt).toEqual(new Date('2023-01-01'));
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
      expect(mockFollowService.getUserFollowing).not.toHaveBeenCalled();
    });

    it('should return empty array when user is not following anyone', async () => {
      // Arrange
      const userId = 'user-no-following';

      // Mock user and follow service responses
      const mockUser = {
        getId: () => userId,
        getUsername: () => 'antisocialuser',
        getDisplayName: () => 'Antisocial User',
        getCreatedAt: () => new Date('2023-01-01'),
      } as unknown as UserAggregate;

      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockFollowService.getUserFollowing.mockResolvedValue([]);
      mockFollowService.getTotalFollowing.mockResolvedValue(0);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFollowService.getUserFollowing).toHaveBeenCalledWith(
        userId,
        1,
        10,
      );

      // Verify the returned following list is empty
      expect(result.data.length).toBe(0);
    });

    it('should skip null followed users', async () => {
      // Arrange
      const userId = 'user-123';
      const followedId = 'followed-1';
      const nonExistentFollowedId = 'non-existent-followed';

      // Mock user and follow service responses
      const mockUser = {
        getId: () => userId,
        getUsername: () => 'testuser',
        getDisplayName: () => 'Test User',
        getCreatedAt: () => new Date('2023-01-01'),
      } as unknown as UserAggregate;

      const mockFollowed = {
        getId: () => followedId,
        getUsername: () => 'followed1',
        getDisplayName: () => 'Followed One',
        getCreatedAt: () => new Date('2023-01-01'),
      } as unknown as UserAggregate;

      const mockFollows = [
        { getFollowedId: () => followedId },
        { getFollowedId: () => nonExistentFollowedId },
      ] as unknown as FollowAggregate[];

      // Setup mock responses
      mockUserService.getUserById.mockImplementation((id) => {
        if (id === userId) return Promise.resolve(mockUser);
        if (id === followedId) return Promise.resolve(mockFollowed);
        return Promise.resolve(null); // Return null for non-existent followed user
      });

      mockFollowService.getUserFollowing.mockResolvedValue(mockFollows);
      mockFollowService.getTotalFollowing.mockResolvedValue(1);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFollowService.getUserFollowing).toHaveBeenCalledWith(
        userId,
        1,
        10,
      );

      // Should have checked each followed user
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followedId);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(
        nonExistentFollowedId,
      );

      // Only one valid followed user should be returned
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe(followedId);
    });
  });
});
