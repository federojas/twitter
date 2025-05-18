import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceImpl } from '../../../../src/domain/services/user.service';
import { USER_REPOSITORY } from '../../../../src/domain/interfaces/repository/repository.tokens';
import { UserAggregate } from '../../../../src/domain/aggregates/user/user.aggregate';
import {
  ConflictException,
  UserNotFoundException,
} from '../../../../src/domain/exceptions/domain.exceptions';

describe('UserServiceImpl', () => {
  let service: UserServiceImpl;

  // Mock repository
  const mockUserRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
    existsByUsername: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserServiceImpl,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserServiceImpl>(UserServiceImpl);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user when username is available', async () => {
      // Arrange
      const mockUser = {
        getId: () => 'test-id',
        getUsername: () => 'testuser',
        getDisplayName: () => 'Test User',
        getCreatedAt: () => new Date(),
      } as unknown as UserAggregate;

      // Mock repository response - username doesn't exist
      mockUserRepository.existsByUsername.mockResolvedValue(false);

      // Act
      const result = await service.createUser(mockUser);

      // Assert
      expect(mockUserRepository.existsByUsername).toHaveBeenCalledWith(
        'testuser',
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith(mockUser);
      expect(result).toBe(mockUser);
    });

    it('should throw ConflictException when username already exists', async () => {
      // Arrange
      const mockUser = {
        getId: () => 'test-id',
        getUsername: () => 'existinguser',
        getDisplayName: () => 'Existing User',
        getCreatedAt: () => new Date(),
      } as unknown as UserAggregate;

      // Mock repository response - username exists
      mockUserRepository.existsByUsername.mockResolvedValue(true);

      // Act & Assert
      await expect(service.createUser(mockUser)).rejects.toThrow(
        new ConflictException(
          `User with username ${mockUser.getUsername()} already exists`,
        ),
      );

      expect(mockUserRepository.existsByUsername).toHaveBeenCalledWith(
        'existinguser',
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user when found by ID', async () => {
      // Arrange
      const userId = 'existing-id';
      const mockUser = {
        getId: () => userId,
        getUsername: () => 'founduser',
        getDisplayName: () => 'Found User',
        getCreatedAt: () => new Date(),
      } as unknown as UserAggregate;

      // Mock repository response
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockUser);
    });

    it('should throw UserNotFoundException when user is not found by ID', async () => {
      // Arrange
      const userId = 'non-existent-id';

      // Mock repository response
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow(
        new UserNotFoundException(userId),
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserByUsername', () => {
    it('should return a user when found by username', async () => {
      // Arrange
      const username = 'existingusername';
      const mockUser = {
        getId: () => 'user-id',
        getUsername: () => username,
        getDisplayName: () => 'Existing Username User',
        getCreatedAt: () => new Date(),
      } as unknown as UserAggregate;

      // Mock repository response
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserByUsername(username);

      // Assert
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(result).toBe(mockUser);
    });

    it('should throw UserNotFoundException when user is not found by username', async () => {
      // Arrange
      const username = 'non-existent-username';

      // Mock repository response
      mockUserRepository.findByUsername.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserByUsername(username)).rejects.toThrow(
        new UserNotFoundException(username),
      );

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(username);
    });
  });

  describe('isUsernameAvailable', () => {
    it('should return true when username is available', async () => {
      // Arrange
      const username = 'available-username';

      // Mock repository response
      mockUserRepository.existsByUsername.mockResolvedValue(false);

      // Act
      const result = await service.isUsernameAvailable(username);

      // Assert
      expect(mockUserRepository.existsByUsername).toHaveBeenCalledWith(
        username,
      );
      expect(result).toBe(true);
    });

    it('should return false when username is not available', async () => {
      // Arrange
      const username = 'taken-username';

      // Mock repository response
      mockUserRepository.existsByUsername.mockResolvedValue(true);

      // Act
      const result = await service.isUsernameAvailable(username);

      // Assert
      expect(mockUserRepository.existsByUsername).toHaveBeenCalledWith(
        username,
      );
      expect(result).toBe(false);
    });
  });
});
