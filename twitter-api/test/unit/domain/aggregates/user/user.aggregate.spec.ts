import { UserAggregate } from '../../../../../src/domain/aggregates/user/user.aggregate';
import {
  NotEmptyException,
  ValidationException,
} from '../../../../../src/domain/exceptions/domain.exceptions';

describe('UserAggregate', () => {
  describe('create', () => {
    it('should create a user with valid data', () => {
      // Arrange
      const username = 'validuser';
      const displayName = 'Valid User';

      // Act
      const user = UserAggregate.create(username, displayName);

      // Assert
      expect(user.getUsername()).toBe(username);
      expect(user.getDisplayName()).toBe(displayName);
      expect(user.getId()).toBeDefined();
      expect(user.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should create a user with a specific ID if provided', () => {
      // Arrange
      const id = 'custom-id-123';
      const username = 'userWithId';
      const displayName = 'User With Custom ID';

      // Act
      const user = UserAggregate.create(username, displayName, id);

      // Assert
      expect(user.getId()).toBe(id);
    });

    it('should throw NotEmptyException if username is empty', () => {
      // Act & Assert
      expect(() => UserAggregate.create('', 'Valid Name')).toThrow(
        NotEmptyException,
      );
    });

    it('should throw NotEmptyException if display name is empty', () => {
      // Act & Assert
      expect(() => UserAggregate.create('validname', '')).toThrow(
        NotEmptyException,
      );
    });

    it('should throw ValidationException if username is too short', () => {
      // Act & Assert
      expect(() => UserAggregate.create('ab', 'Valid Name')).toThrow(
        ValidationException,
      );
      expect(() => UserAggregate.create('ab', 'Valid Name')).toThrow(
        `User username must be at least ${UserAggregate.MIN_USERNAME_LENGTH} characters long`,
      );
    });

    it('should throw ValidationException if username is too long', () => {
      // Arrange
      const longUsername = 'a'.repeat(UserAggregate.MAX_USERNAME_LENGTH + 1);

      // Act & Assert
      expect(() => UserAggregate.create(longUsername, 'Valid Name')).toThrow(
        ValidationException,
      );
      expect(() => UserAggregate.create(longUsername, 'Valid Name')).toThrow(
        `User username cannot exceed ${UserAggregate.MAX_USERNAME_LENGTH} characters`,
      );
    });

    it('should throw ValidationException if username contains invalid characters', () => {
      // Act & Assert
      expect(() =>
        UserAggregate.create('invalid@username', 'Valid Name'),
      ).toThrow(ValidationException);
      expect(() =>
        UserAggregate.create('invalid@username', 'Valid Name'),
      ).toThrow(
        'User username can only contain letters, numbers, and underscores',
      );
    });

    it('should throw ValidationException if display name is too short', () => {
      // Act & Assert
      expect(() => UserAggregate.create('validuser', 'AB')).toThrow(
        ValidationException,
      );
      expect(() => UserAggregate.create('validuser', 'AB')).toThrow(
        `User display name must be at least ${UserAggregate.MIN_DISPLAY_NAME_LENGTH} characters long`,
      );
    });

    it('should throw ValidationException if display name is too long', () => {
      // Arrange
      const longDisplayName = 'a'.repeat(
        UserAggregate.MAX_DISPLAY_NAME_LENGTH + 1,
      );

      // Act & Assert
      expect(() => UserAggregate.create('validuser', longDisplayName)).toThrow(
        ValidationException,
      );
      expect(() => UserAggregate.create('validuser', longDisplayName)).toThrow(
        `User display name cannot exceed ${UserAggregate.MAX_DISPLAY_NAME_LENGTH} characters`,
      );
    });
  });

  describe('hasUsername', () => {
    it('should return true if username matches', () => {
      // Arrange
      const username = 'testusername';
      const user = UserAggregate.create(username, 'Test User');

      // Act & Assert
      expect(user.hasUsername(username)).toBe(true);
    });

    it('should return false if username does not match', () => {
      // Arrange
      const user = UserAggregate.create('testusername', 'Test User');

      // Act & Assert
      expect(user.hasUsername('differentusername')).toBe(false);
    });
  });

  describe('toDTO', () => {
    it('should return a proper DTO with all properties', () => {
      // Arrange
      const id = 'dto-id';
      const username = 'dtouser';
      const displayName = 'DTO User';
      const user = UserAggregate.create(username, displayName, id);

      // Act
      const dto = user.toDTO();

      // Assert
      expect(dto).toEqual({
        id,
        username,
        displayName,
        createdAt: user.getCreatedAt(),
      });
    });
  });
});
