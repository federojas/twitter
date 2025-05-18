import { Test, TestingModule } from '@nestjs/testing';
import { FollowServiceImpl } from '../../../../src/domain/services/follow.service';
import { FOLLOW_REPOSITORY } from '../../../../src/domain/interfaces/repository/repository.tokens';
import { FollowAggregate } from '../../../../src/domain/aggregates/follow/follow.aggregate';
import {
  ConflictException,
  FollowNotFoundException,
  ResourceNotFoundException,
  ValidationException,
} from '../../../../src/domain/exceptions/domain.exceptions';

describe('FollowServiceImpl', () => {
  let service: FollowServiceImpl;

  // Mock repository
  const mockFollowRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByFollowerAndFollowed: jest.fn(),
    findFollowers: jest.fn(),
    findFollowing: jest.fn(),
    isFollowing: jest.fn(),
    delete: jest.fn(),
  };

  // Store original static method before tests
  const originalFollowCreate = jest.spyOn(FollowAggregate, 'create');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowServiceImpl,
        {
          provide: FOLLOW_REPOSITORY,
          useValue: mockFollowRepository,
        },
      ],
    }).compile();

    service = module.get<FollowServiceImpl>(FollowServiceImpl);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original implementation after each test
    originalFollowCreate.mockRestore();
  });

  describe('createFollow', () => {
    it('should create a new follow relationship when it does not exist yet', async () => {
      // Arrange
      const followerId = 'follower-123';
      const followedId = 'followed-456';

      // Mock Follow.create implementation
      const mockFollow = {
        getId: () => 'follow-789',
        getFollowerId: () => followerId,
        getFollowedId: () => followedId,
        getCreatedAt: () => new Date(),
      } as unknown as FollowAggregate;

      jest.spyOn(FollowAggregate, 'create').mockReturnValue(mockFollow);

      // Mock repository response
      mockFollowRepository.isFollowing.mockResolvedValue(false);

      // Act
      const result = await service.createFollow(followerId, followedId);

      // Assert
      expect(mockFollowRepository.isFollowing).toHaveBeenCalledWith(
        followerId,
        followedId,
      );
      expect(FollowAggregate.create).toHaveBeenCalledWith(
        followerId,
        followedId,
      );
      expect(mockFollowRepository.create).toHaveBeenCalledWith(mockFollow);
      expect(result).toBe(mockFollow);
    });

    it('should throw ValidationException when user tries to follow themselves', async () => {
      // Arrange
      const userId = 'same-user-id';

      // Act & Assert
      await expect(service.createFollow(userId, userId)).rejects.toThrow(
        new ValidationException('Users cannot follow themselves'),
      );

      expect(mockFollowRepository.isFollowing).not.toHaveBeenCalled();
      expect(mockFollowRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when follow relationship already exists', async () => {
      // Arrange
      const followerId = 'existing-follower';
      const followedId = 'existing-followed';

      // Mock repository response
      mockFollowRepository.isFollowing.mockResolvedValue(true);

      // Act & Assert
      await expect(
        service.createFollow(followerId, followedId),
      ).rejects.toThrow(
        new ConflictException('Follow relationship already exists'),
      );

      expect(mockFollowRepository.isFollowing).toHaveBeenCalledWith(
        followerId,
        followedId,
      );
      expect(mockFollowRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getFollowById', () => {
    it('should return a follow relationship when found by ID', async () => {
      // Arrange
      const followId = 'existing-follow-id';
      const mockFollow = {
        getId: () => followId,
        getFollowerId: () => 'follower-123',
        getFollowedId: () => 'followed-456',
        getCreatedAt: () => new Date(),
      } as unknown as FollowAggregate;

      // Mock repository response
      mockFollowRepository.findById.mockResolvedValue(mockFollow);

      // Act
      const result = await service.getFollowById(followId);

      // Assert
      expect(mockFollowRepository.findById).toHaveBeenCalledWith(followId);
      expect(result).toBe(mockFollow);
    });

    it('should throw FollowNotFoundException when follow is not found by ID', async () => {
      // Arrange
      const followId = 'non-existent-follow';

      // Mock repository response
      mockFollowRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getFollowById(followId)).rejects.toThrow(
        new FollowNotFoundException(followId),
      );

      expect(mockFollowRepository.findById).toHaveBeenCalledWith(followId);
    });
  });

  describe('getUserFollowers', () => {
    it('should return followers for a user', async () => {
      // Arrange
      const userId = 'user-with-followers';
      const mockFollowers = [
        {
          getId: () => 'follow-1',
          getFollowerId: () => 'follower-1',
          getFollowedId: () => userId,
        },
        {
          getId: () => 'follow-2',
          getFollowerId: () => 'follower-2',
          getFollowedId: () => userId,
        },
      ] as unknown as FollowAggregate[];

      // Mock repository response
      mockFollowRepository.findFollowers.mockResolvedValue(mockFollowers);

      // Act
      const result = await service.getUserFollowers(userId);

      // Assert
      expect(mockFollowRepository.findFollowers).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockFollowers);
      expect(result.length).toBe(2);
    });

    it('should return empty array when user has no followers', async () => {
      // Arrange
      const userId = 'user-without-followers';

      // Mock repository response
      mockFollowRepository.findFollowers.mockResolvedValue([]);

      // Act
      const result = await service.getUserFollowers(userId);

      // Assert
      expect(mockFollowRepository.findFollowers).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });

  describe('getUserFollowing', () => {
    it('should return users that the user is following', async () => {
      // Arrange
      const userId = 'following-user';
      const mockFollowing = [
        {
          getId: () => 'follow-1',
          getFollowerId: () => userId,
          getFollowedId: () => 'followed-1',
        },
        {
          getId: () => 'follow-2',
          getFollowerId: () => userId,
          getFollowedId: () => 'followed-2',
        },
      ] as unknown as FollowAggregate[];

      // Mock repository response
      mockFollowRepository.findFollowing.mockResolvedValue(mockFollowing);

      // Act
      const result = await service.getUserFollowing(userId);

      // Assert
      expect(mockFollowRepository.findFollowing).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockFollowing);
      expect(result.length).toBe(2);
    });

    it('should return empty array when user is not following anyone', async () => {
      // Arrange
      const userId = 'non-following-user';

      // Mock repository response
      mockFollowRepository.findFollowing.mockResolvedValue([]);

      // Act
      const result = await service.getUserFollowing(userId);

      // Assert
      expect(mockFollowRepository.findFollowing).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });

  describe('isFollowing', () => {
    it('should return true when follow relationship exists', async () => {
      // Arrange
      const followerId = 'follower-exists';
      const followedId = 'followed-exists';

      // Mock repository response
      mockFollowRepository.isFollowing.mockResolvedValue(true);

      // Act
      const result = await service.isFollowing(followerId, followedId);

      // Assert
      expect(mockFollowRepository.isFollowing).toHaveBeenCalledWith(
        followerId,
        followedId,
      );
      expect(result).toBe(true);
    });

    it('should return false when follow relationship does not exist', async () => {
      // Arrange
      const followerId = 'follower-not-exists';
      const followedId = 'followed-not-exists';

      // Mock repository response
      mockFollowRepository.isFollowing.mockResolvedValue(false);

      // Act
      const result = await service.isFollowing(followerId, followedId);

      // Assert
      expect(mockFollowRepository.isFollowing).toHaveBeenCalledWith(
        followerId,
        followedId,
      );
      expect(result).toBe(false);
    });
  });

  describe('unfollow', () => {
    it('should delete a follow relationship when it exists', async () => {
      // Arrange
      const followerId = 'follower-to-delete';
      const followedId = 'followed-to-delete';
      const followId = 'follow-to-delete';

      const mockFollow = {
        getId: () => followId,
        getFollowerId: () => followerId,
        getFollowedId: () => followedId,
      } as unknown as FollowAggregate;

      // Mock repository responses
      mockFollowRepository.findByFollowerAndFollowed.mockResolvedValue(
        mockFollow,
      );

      // Act
      const result = await service.unfollow(followerId, followedId);

      // Assert
      expect(
        mockFollowRepository.findByFollowerAndFollowed,
      ).toHaveBeenCalledWith(followerId, followedId);
      expect(mockFollowRepository.delete).toHaveBeenCalledWith(followId);
      expect(result).toBe(true);
    });

    it('should throw ResourceNotFoundException when follow relationship does not exist', async () => {
      // Arrange
      const followerId = 'non-existent-follower';
      const followedId = 'non-existent-followed';

      // Mock repository response
      mockFollowRepository.findByFollowerAndFollowed.mockResolvedValue(null);

      // Act & Assert
      await expect(service.unfollow(followerId, followedId)).rejects.toThrow(
        new ResourceNotFoundException('Follow relationship'),
      );

      expect(
        mockFollowRepository.findByFollowerAndFollowed,
      ).toHaveBeenCalledWith(followerId, followedId);
      expect(mockFollowRepository.delete).not.toHaveBeenCalled();
    });
  });
});
