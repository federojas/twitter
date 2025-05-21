import { Test, TestingModule } from '@nestjs/testing';
import { USER_SERVICE } from '../../../../../src/domain/interfaces/service/service.tokens';
import { UserAggregate } from '../../../../../src/domain/aggregates/user/user.aggregate';
import { GetUserByIdUseCase } from '../../../../../src/application/use-cases/user/get-user-by-id.use-case';
import { UserNotFoundException } from '../../../../../src/domain/exceptions/domain.exceptions';

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
        createdAt: expect.any(Date),
      });
    });

    it('should throw UserNotFoundException when user is not found', async () => {
      // Arrange
      const userId = 'non-existent-id';

      // Mock service to return null (user not found)
      mockUserService.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(userId)).rejects.toThrow(
        UserNotFoundException,
      );

      // Verify service was called
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
    });
  });
});
