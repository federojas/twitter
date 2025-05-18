import { Test, TestingModule } from '@nestjs/testing';
import { UserRepositoryImpl } from '../../../../../../src/infrastructure/database/in-memory/repositories/user.repository';
import { UserAggregate } from '../../../../../../src/domain/aggregates/user/user.aggregate';

describe('UserRepositoryImpl', () => {
  let repository: UserRepositoryImpl;

  // Setup test module before each test
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepositoryImpl],
    }).compile();

    repository = module.get<UserRepositoryImpl>(UserRepositoryImpl);
  });

  // Mock a user aggregate for testing
  const createMockUser = (
    id: string,
    username: string,
    displayName: string,
  ): UserAggregate => {
    const userAggregate = {
      getId: jest.fn().mockReturnValue(id),
      getUsername: jest.fn().mockReturnValue(username),
      getDisplayName: jest.fn().mockReturnValue(displayName),
    } as unknown as UserAggregate;

    return userAggregate;
  };

  describe('create', () => {
    it('should create a user and store it by ID and username', async () => {
      // Arrange
      const userId = 'user-123';
      const username = 'testuser';
      const displayName = 'Test User';
      const user = createMockUser(userId, username, displayName);

      // Act
      await repository.create(user);

      // Assert
      const foundById = await repository.findById(userId);
      const foundByUsername = await repository.findByUsername(username);

      expect(foundById).toBe(user);
      expect(foundByUsername).toBe(user);
    });
  });

  describe('findById', () => {
    it('should return null for non-existent user', async () => {
      // Act
      const user = await repository.findById('non-existent-id');

      // Assert
      expect(user).toBeNull();
    });

    it('should return user when found by ID', async () => {
      // Arrange
      const userId = 'user-456';
      const username = 'anotheruser';
      const displayName = 'Another User';
      const user = createMockUser(userId, username, displayName);
      await repository.create(user);

      // Act
      const foundUser = await repository.findById(userId);

      // Assert
      expect(foundUser).toBe(user);
    });
  });

  describe('findByUsername', () => {
    it('should return null for non-existent username', async () => {
      // Act
      const user = await repository.findByUsername('non-existent-username');

      // Assert
      expect(user).toBeNull();
    });

    it('should return user when found by username', async () => {
      // Arrange
      const userId = 'user-789';
      const username = 'thirduser';
      const displayName = 'Third User';
      const user = createMockUser(userId, username, displayName);
      await repository.create(user);

      // Act
      const foundUser = await repository.findByUsername(username);

      // Assert
      expect(foundUser).toBe(user);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no users exist', async () => {
      // Act
      const users = await repository.findAll();

      // Assert
      expect(users).toEqual([]);
    });

    it('should return all users', async () => {
      // Arrange
      const user1 = createMockUser('user-1', 'user1', 'User One');
      const user2 = createMockUser('user-2', 'user2', 'User Two');
      await repository.create(user1);
      await repository.create(user2);

      // Act
      const users = await repository.findAll();

      // Assert
      expect(users).toHaveLength(2);
      expect(users).toContain(user1);
      expect(users).toContain(user2);
    });
  });

  describe('existsByUsername', () => {
    it('should return false for non-existent username', async () => {
      // Act
      const exists = await repository.existsByUsername('non-existent-username');

      // Assert
      expect(exists).toBe(false);
    });

    it('should return true for existing username', async () => {
      // Arrange
      const username = 'existinguser';
      const user = createMockUser('user-exists', username, 'Existing User');
      await repository.create(user);

      // Act
      const exists = await repository.existsByUsername(username);

      // Assert
      expect(exists).toBe(true);
    });
  });
});
