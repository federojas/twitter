import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceImpl } from '../../../../src/domain/services/user.service';
import { USER_REPOSITORY } from '../../../../src/domain/interfaces/repository/repository.tokens';
import { UserAggregate } from '../../../../src/domain/aggregates/user/user.aggregate';
import {
  ConflictException,
  UserNotFoundException,
} from '../../../../src/domain/exceptions/domain.exceptions';

describe('UserService', () => {
  let service: UserServiceImpl;

  // Mock the repository
  const mockUserRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
    findAll: jest.fn(),
    existsByUsername: jest.fn(),
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
    it('should create a user successfully', async () => {
      // Arrange
      const mockUser = {
        getId: () => 'test-id',
        getUsername: () => 'testuser',
      } as unknown as UserAggregate;

      // Mock repository to indicate username doesn't exist yet
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

    it('should throw ConflictException if username already exists', async () => {
      // Arrange
      const mockUser = {
        getId: () => 'test-id',
        getUsername: () => 'existinguser',
      } as unknown as UserAggregate;

      // Mock repository to indicate username already exists
      mockUserRepository.existsByUsername.mockResolvedValue(true);

      // Act & Assert
      await expect(service.createUser(mockUser)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.existsByUsername).toHaveBeenCalledWith(
        'existinguser',
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user when they exist', async () => {
      // Arrange
      const userId = 'existing-user-id';
      const mockUser = {
        getId: () => userId,
      } as unknown as UserAggregate;

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBe(mockUser);
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-user-id';
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      // Arrange
      const mockUsers = [
        { getId: () => 'user1' },
        { getId: () => 'user2' },
        { getId: () => 'user3' },
        { getId: () => 'user4' },
        { getId: () => 'user5' },
      ] as unknown as UserAggregate[];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      // Act - Get first page with 2 users per page
      const result = await service.getUsers(1, 2);

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result[0].getId()).toBe('user1');
      expect(result[1].getId()).toBe('user2');
    });

    it('should return second page of users', async () => {
      // Arrange
      const mockUsers = [
        { getId: () => 'user1' },
        { getId: () => 'user2' },
        { getId: () => 'user3' },
        { getId: () => 'user4' },
        { getId: () => 'user5' },
      ] as unknown as UserAggregate[];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      // Act - Get second page with 2 users per page
      const result = await service.getUsers(2, 2);

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result[0].getId()).toBe('user3');
      expect(result[1].getId()).toBe('user4');
    });

    it('should handle partial last page', async () => {
      // Arrange
      const mockUsers = [
        { getId: () => 'user1' },
        { getId: () => 'user2' },
        { getId: () => 'user3' },
        { getId: () => 'user4' },
        { getId: () => 'user5' },
      ] as unknown as UserAggregate[];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      // Act - Get third page with 2 users per page (only 1 user should be left)
      const result = await service.getUsers(3, 2);

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result.length).toBe(1);
      expect(result[0].getId()).toBe('user5');
    });

    it('should handle empty results for out of range pages', async () => {
      // Arrange
      const mockUsers = [
        { getId: () => 'user1' },
        { getId: () => 'user2' },
      ] as unknown as UserAggregate[];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      // Act - Get page that doesn't exist
      const result = await service.getUsers(3, 2);

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result.length).toBe(0);
    });

    it('should use default pagination values if not provided', async () => {
      // Arrange
      const mockUsers = Array.from({ length: 15 }, (_, i) => ({
        getId: () => `user${i + 1}`,
      })) as unknown as UserAggregate[];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      // Act - Don't provide any pagination params
      const result = await service.getUsers();

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      // Default should be 10 per page
      expect(result.length).toBe(10);
    });
  });

  describe('getTotalUsers', () => {
    it('should return the total number of users', async () => {
      // Arrange
      const mockUsers = [
        { getId: () => 'user1' },
        { getId: () => 'user2' },
        { getId: () => 'user3' },
      ] as unknown as UserAggregate[];

      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await service.getTotalUsers();

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toBe(3);
    });

    it('should return 0 for empty user list', async () => {
      // Arrange
      mockUserRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.getTotalUsers();

      // Assert
      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });

  describe('getUserByUsername', () => {
    it('should return a user when they exist', async () => {
      // Arrange
      const username = 'existinguser';
      const mockUser = {
        getId: () => 'user-id',
        getUsername: () => username,
      } as unknown as UserAggregate;

      mockUserRepository.findByUsername.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserByUsername(username);

      // Assert
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(result).toBe(mockUser);
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      // Arrange
      const username = 'nonexistentuser';
      mockUserRepository.findByUsername.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserByUsername(username)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(username);
    });
  });

  describe('isUsernameAvailable', () => {
    it('should return true when username is available', async () => {
      // Arrange
      const username = 'newusername';
      mockUserRepository.existsByUsername.mockResolvedValue(false);

      // Act
      const result = await service.isUsernameAvailable(username);

      // Assert
      expect(mockUserRepository.existsByUsername).toHaveBeenCalledWith(
        username,
      );
      expect(result).toBe(true);
    });

    it('should return false when username is taken', async () => {
      // Arrange
      const username = 'takenusername';
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
