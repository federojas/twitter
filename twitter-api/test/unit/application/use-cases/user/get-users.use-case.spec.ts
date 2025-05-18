import { Test, TestingModule } from '@nestjs/testing';
import { GetUserByIdUseCase } from '../../../../../src/application/use-cases/user/get-users.use-case';
import { USER_SERVICE } from '../../../../../src/domain/interfaces/service/service.tokens';
import { UserAggregate } from '../../../../../src/domain/aggregates/user/user.aggregate';
import { UserDto } from '../../../../../src/application/dtos/user.dto';
import { UserNotFoundException } from '../../../../../src/domain/exceptions/domain.exceptions';
import { LinkGenerator } from '../../../../../src/application/utils/link-generator';

// Mock the LinkGenerator utility
jest.mock('../../../../../src/application/utils/link-generator', () => ({
  LinkGenerator: {
    enhanceUserWithLinks: jest.fn(
      (userDto: UserDto): UserDto & { _links: any } => ({
        ...userDto,
        _links: {
          self: { href: `/users/${userDto.id}` },
          tweets: { href: `/users/${userDto.id}/tweets` },
          followers: { href: `/users/${userDto.id}/followers` },
          following: { href: `/users/${userDto.id}/following` },
        },
      }),
    ),
  },
}));

describe('GetUserByIdUseCase', () => {
  let useCase: GetUserByIdUseCase;

  // Mock user service
  const mockUserService = {
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdUseCase,
        {
          provide: USER_SERVICE,
          useValue: mockUserService,
        },
      ],
    }).compile();

    useCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a user when found by ID', async () => {
      // Arrange
      const userId = 'test-user-id';
      const mockUser = {
        getId: () => userId,
        getUsername: () => 'testuser',
        getDisplayName: () => 'Test User',
        getCreatedAt: () => new Date('2023-01-01'),
        toDTO: () => ({
          id: userId,
          username: 'testuser',
          displayName: 'Test User',
          createdAt: new Date('2023-01-01'),
        }),
      } as unknown as UserAggregate;

      // Mock the service response
      mockUserService.getUserById.mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        id: userId,
        username: 'testuser',
        displayName: 'Test User',
        createdAt: expect.any(Date) as Date,
        _links: {
          self: { href: `/users/${userId}` },
          tweets: { href: `/users/${userId}/tweets` },
          followers: { href: `/users/${userId}/followers` },
          following: { href: `/users/${userId}/following` },
        },
      });

      // Verify LinkGenerator was called
      expect(LinkGenerator.enhanceUserWithLinks).toHaveBeenCalled();
    });

    it('should throw UserNotFoundException when user is not found', async () => {
      // Arrange
      const userId = 'non-existent-id';

      // Mock service to return null (user not found)
      mockUserService.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(userId)).rejects.toThrow(
        new UserNotFoundException(userId),
      );

      // Verify service was called
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(LinkGenerator.enhanceUserWithLinks).not.toHaveBeenCalled();
    });
  });
});
