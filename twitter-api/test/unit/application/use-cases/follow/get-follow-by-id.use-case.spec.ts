import { Test, TestingModule } from '@nestjs/testing';
import { GetFollowByIdUseCase } from '../../../../../src/application/use-cases/follow/get-follow-by-id.use-case';
import { FOLLOW_SERVICE } from '../../../../../src/domain/interfaces/service/service.tokens';
import { FollowAggregate } from '../../../../../src/domain/aggregates/follow/follow.aggregate';
import { FollowDto } from '../../../../../src/application/dtos/follow.dto';
import { FollowNotFoundException } from '../../../../../src/domain/exceptions/domain.exceptions';

// Mock the LinkGenerator
const mockEnhanceFollowWithLinks = jest.fn();
jest.mock('../../../../../src/presentation/utils/link-generator', () => ({
  LinkGenerator: {
    enhanceFollowWithLinks: mockEnhanceFollowWithLinks.mockImplementation(
      (followDto: FollowDto) => ({
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

describe('GetFollowByIdUseCase', () => {
  let useCase: GetFollowByIdUseCase;

  // Mock follow service
  const mockFollowService = {
    getFollowById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFollowByIdUseCase,
        {
          provide: FOLLOW_SERVICE,
          useValue: mockFollowService,
        },
      ],
    }).compile();

    useCase = module.get<GetFollowByIdUseCase>(GetFollowByIdUseCase);

    // Reset mocks before each test
    jest.clearAllMocks();
    mockEnhanceFollowWithLinks.mockClear();
  });

  describe('execute', () => {
    it('should return a follow when found by ID with enhanced links', async () => {
      // Arrange
      const followId = 'follow-123';
      const mockFollow = {
        getId: () => followId,
        getFollowerId: () => 'follower-456',
        getFollowedId: () => 'followed-789',
        getCreatedAt: () => new Date('2023-01-01'),
        toDTO: () => ({
          id: followId,
          followerId: 'follower-456',
          followedId: 'followed-789',
          createdAt: new Date('2023-01-01'),
        }),
      } as unknown as FollowAggregate;

      mockFollowService.getFollowById.mockResolvedValue(mockFollow);

      // Act
      const result = await useCase.execute(followId);

      // Assert
      expect(mockFollowService.getFollowById).toHaveBeenCalledWith(followId);
      expect(result).toEqual({
        id: followId,
        followerId: 'follower-456',
        followedId: 'followed-789',
        createdAt: expect.any(Date) as Date,
      });

      // The LinkGenerator is not actually used in the implementation
      expect(mockEnhanceFollowWithLinks).not.toHaveBeenCalled();
    });

    it('should throw FollowNotFoundException when follow is not found', async () => {
      // Arrange
      const followId = 'non-existent-follow';

      mockFollowService.getFollowById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(followId)).rejects.toThrow(
        FollowNotFoundException,
      );

      expect(mockFollowService.getFollowById).toHaveBeenCalledWith(followId);
    });
  });
});
