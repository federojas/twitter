import { Test, TestingModule } from '@nestjs/testing';
import { UnfollowUseCase } from '../../../../../src/application/use-cases/follow/unfollow.use-case';
import {
  FOLLOW_SERVICE,
  USER_SERVICE,
} from '../../../../../src/domain/interfaces/service/service.tokens';
import { UserNotFoundException } from '../../../../../src/domain/exceptions/domain.exceptions';

describe('UnfollowUseCase', () => {
  let useCase: UnfollowUseCase;

  // Mock services
  const mockUserService = {
    getUserById: jest.fn(),
  };

  const mockFollowService = {
    unfollow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnfollowUseCase,
        {
          provide: USER_SERVICE,
          useValue: mockUserService,
        },
        {
          provide: FOLLOW_SERVICE,
          useValue: mockFollowService,
        },
      ],
    }).compile();

    useCase = module.get<UnfollowUseCase>(UnfollowUseCase);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully unfollow a user', async () => {
      // Arrange
      const followerId = 'follower-123';
      const followedId = 'followed-456';

      mockUserService.getUserById.mockImplementation((id) => {
        return Promise.resolve({ id });
      });

      mockFollowService.unfollow.mockResolvedValue(true);

      // Act
      const result = await useCase.execute(followerId, followedId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followedId);
      expect(mockFollowService.unfollow).toHaveBeenCalledWith(
        followerId,
        followedId,
      );
      expect(result).toBe(true);
    });

    it('should throw UserNotFoundException when follower does not exist', async () => {
      // Arrange
      const followerId = 'non-existent-follower';
      const followedId = 'followed-456';

      mockUserService.getUserById.mockImplementation((id) => {
        if (id === followerId) {
          throw new UserNotFoundException(id);
        }
        return Promise.resolve({ id });
      });

      // Act & Assert
      await expect(useCase.execute(followerId, followedId)).rejects.toThrow(
        UserNotFoundException,
      );

      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId);
      expect(mockFollowService.unfollow).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundException when followed user does not exist', async () => {
      // Arrange
      const followerId = 'follower-123';
      const followedId = 'non-existent-followed';

      mockUserService.getUserById.mockImplementation((id) => {
        if (id === followedId) {
          throw new UserNotFoundException(id);
        }
        return Promise.resolve({ id });
      });

      // Act & Assert
      await expect(useCase.execute(followerId, followedId)).rejects.toThrow(
        UserNotFoundException,
      );

      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followedId);
      expect(mockFollowService.unfollow).not.toHaveBeenCalled();
    });

    it('should return false when unfollow fails', async () => {
      // Arrange
      const followerId = 'follower-123';
      const followedId = 'followed-456';

      mockUserService.getUserById.mockImplementation((id) => {
        return Promise.resolve({ id });
      });

      mockFollowService.unfollow.mockResolvedValue(false);

      // Act
      const result = await useCase.execute(followerId, followedId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followedId);
      expect(mockFollowService.unfollow).toHaveBeenCalledWith(
        followerId,
        followedId,
      );
      expect(result).toBe(false);
    });
  });
});
