import { Test, TestingModule } from '@nestjs/testing';
import { CreateFollowUseCase } from '../../../../../src/application/use-cases/follow/create-follow.use-case';
import {
  FOLLOW_SERVICE,
  USER_SERVICE,
} from '../../../../../src/domain/interfaces/service/service.tokens';
import { FollowDto } from '../../../../../src/application/dtos/follow.dto';
import { UserNotFoundException } from '../../../../../src/domain/exceptions/domain.exceptions';
import { LinkGenerator } from '../../../../../src/application/utils/link-generator';
import { FollowAggregate } from '../../../../../src/domain/aggregates/follow/follow.aggregate';
import { UserAggregate } from '../../../../../src/domain/aggregates/user/user.aggregate';

// Mock the LinkGenerator utility
jest.mock('../../../../../src/application/utils/link-generator', () => ({
  LinkGenerator: {
    enhanceFollowWithLinks: jest.fn(
      (followDto: FollowDto): FollowDto & { _links: any } => ({
        ...followDto,
        _links: {
          self: { href: `/follows/${followDto.id}` },
          follower: { href: `/users/${followDto.followerId}` },
          followed: { href: `/users/${followDto.followedId}` },
        },
      }),
    ),
  },
}));

describe('CreateFollowUseCase', () => {
  let useCase: CreateFollowUseCase;

  // Mock services
  const mockFollowService = {
    createFollow: jest.fn(),
  };

  const mockUserService = {
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateFollowUseCase,
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

    useCase = module.get<CreateFollowUseCase>(CreateFollowUseCase);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a follow relationship successfully when both users exist', async () => {
      // Arrange
      const followerId = 'follower-id';
      const followedId = 'followed-id';

      // Mock users
      const followerUser = {
        getId: () => followerId,
      } as unknown as UserAggregate;

      const followedUser = {
        getId: () => followedId,
      } as unknown as UserAggregate;

      // Mock the user service to return users
      mockUserService.getUserById.mockImplementation((id: string) => {
        if (id === followerId) return Promise.resolve(followerUser);
        if (id === followedId) return Promise.resolve(followedUser);
        return Promise.resolve(null);
      });

      // Mock the follow service to return a follow aggregate
      const followId = 'follow-123';
      const mockFollow = {
        getId: () => followId,
        getFollowerId: () => followerId,
        getFollowedId: () => followedId,
        getCreatedAt: () => new Date(),
        toDTO: () => ({
          id: followId,
          followerId: followerId,
          followedId: followedId,
          createdAt: new Date(),
        }),
      } as unknown as FollowAggregate;

      mockFollowService.createFollow.mockResolvedValue(mockFollow);

      // Act
      const result = await useCase.execute(followerId, followedId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followedId);
      expect(mockFollowService.createFollow).toHaveBeenCalledWith(
        followerId,
        followedId,
      );

      // Verify the returned DTO has the expected properties
      expect(result).toEqual({
        id: followId,
        followerId: followerId,
        followedId: followedId,
        createdAt: expect.any(Date) as Date,
        _links: {
          self: { href: `/follows/${followId}` },
          follower: { href: `/users/${followerId}` },
          followed: { href: `/users/${followedId}` },
        },
      });

      // Verify LinkGenerator was called
      expect(LinkGenerator.enhanceFollowWithLinks).toHaveBeenCalled();
    });

    it('should throw UserNotFoundException when follower does not exist', async () => {
      // Arrange
      const followerId = 'non-existent-follower';
      const followedId = 'followed-id';

      // Mock follower user to throw exception
      mockUserService.getUserById.mockImplementation((id: string) => {
        if (id === followerId)
          return Promise.reject(new UserNotFoundException(followerId));
        return Promise.resolve({} as UserAggregate);
      });

      // Act & Assert
      await expect(useCase.execute(followerId, followedId)).rejects.toThrow(
        UserNotFoundException,
      );

      // Verify services were called correctly
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId);
      expect(mockFollowService.createFollow).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundException when followed user does not exist', async () => {
      // Arrange
      const followerId = 'follower-id';
      const followedId = 'non-existent-followed';

      // Mock user service to throw exception for followed user
      mockUserService.getUserById.mockImplementation((id: string) => {
        if (id === followerId) return Promise.resolve({} as UserAggregate);
        if (id === followedId)
          return Promise.reject(new UserNotFoundException(followedId));
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(useCase.execute(followerId, followedId)).rejects.toThrow(
        UserNotFoundException,
      );

      // Verify services were called correctly
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followerId);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(followedId);
      expect(mockFollowService.createFollow).not.toHaveBeenCalled();
    });
  });
});
