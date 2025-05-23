import { Test, TestingModule } from '@nestjs/testing';
import { GetFollowersUseCase } from '../../../../../src/application/use-cases/user/get-followers.use-case';
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

describe('GetFollowersUseCase', () => {
  let useCase: GetFollowersUseCase;

  // Mock services
  const mockFollowService = {
    getUserFollowers: jest.fn(),
    getTotalFollowers: jest.fn(),
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
    it('should return a list of followers', async () => {
      // Arrange
      const userId = 'user-123';
      const followerId1 = 'follower-1';
      const followerId2 = 'follower-2';

      // Mock user and follow service responses
      const mockUser = {
        getId: () => userId,
        getUsername: () => 'testuser',
        getDisplayName: () => 'Test User',
        getCreatedAt: () => new Date('2023-01-01'),
      } as unknown as UserAggregate;

      const mockFollower1 = {
        getId: () => followerId1,
        getUsername: () => 'follower1',
        getDisplayName: () => 'Follower One',
        getCreatedAt: () => new Date('2023-01-01'),
      } as unknown as UserAggregate;

      const mockFollower2 = {
        getId: () => followerId2,
        getUsername: () => 'follower2',
        getDisplayName: () => 'Follower Two',
        getCreatedAt: () => new Date('2023-01-01'),
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
      mockFollowService.getTotalFollowers.mockResolvedValue(2);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFollowService.getUserFollowers).toHaveBeenCalledWith(
        userId,
        1,
        10,
      );

      // Should have checked each follower
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId1);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId2);

      // LinkGenerator is not used in the implementation
      expect(mockEnhanceFollowUsersWithLinks).not.toHaveBeenCalled();

      // Verify the returned follower list
      expect(result.data.length).toBe(2);

      // Check first follower details
      expect(result.data[0].id).toBe(followerId1);
      expect(result.data[0].username).toBe('follower1');
      expect(result.data[0].displayName).toBe('Follower One');
      expect(result.data[0].createdAt).toEqual(new Date('2023-01-01'));

      // Check second follower details
      expect(result.data[1].id).toBe(followerId2);
      expect(result.data[1].username).toBe('follower2');
      expect(result.data[1].displayName).toBe('Follower Two');
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
      mockFollowService.getTotalFollowers.mockResolvedValue(0);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFollowService.getUserFollowers).toHaveBeenCalledWith(
        userId,
        1,
        10,
      );

      // Verify the returned follower list is empty
      expect(result.data.length).toBe(0);
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
        getCreatedAt: () => new Date('2023-01-01'),
      } as unknown as UserAggregate;

      const mockFollower = {
        getId: () => followerId,
        getUsername: () => 'follower1',
        getDisplayName: () => 'Follower One',
        getCreatedAt: () => new Date('2023-01-01'),
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
      mockFollowService.getTotalFollowers.mockResolvedValue(1);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFollowService.getUserFollowers).toHaveBeenCalledWith(
        userId,
        1,
        10,
      );

      // Should have checked each follower
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(
        nonExistentFollowerId,
      );

      // Only one valid follower should be returned
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe(followerId);
    });
  });
});
