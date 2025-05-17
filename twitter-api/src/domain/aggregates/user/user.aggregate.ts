import { randomUUID } from 'crypto';
import {
  NotEmptyException,
  ValidationException,
} from 'src/domain/exceptions/domain.exceptions';

/**
 * User Aggregate Root
 * Encapsula el aggregate de usuario y todas sus reglas de negocio
 */
export class UserAggregate {
  private readonly id: string;
  private readonly username: string;
  private readonly displayName: string;
  private readonly createdAt: Date;

  static MIN_USERNAME_LENGTH = 3;
  static MAX_USERNAME_LENGTH = 20;
  static MIN_DISPLAY_NAME_LENGTH = 3;
  static MAX_DISPLAY_NAME_LENGTH = 50;

  private constructor(
    id: string,
    username: string,
    displayName: string,
    createdAt: Date,
  ) {
    this.id = id;
    this.username = username;
    this.displayName = displayName;
    this.createdAt = createdAt;
  }

  private static validateUsername(username: string): void {
    if (!username) {
      throw new NotEmptyException('User username');
    }

    if (username.length < UserAggregate.MIN_USERNAME_LENGTH) {
      throw new ValidationException(
        `User username must be at least ${UserAggregate.MIN_USERNAME_LENGTH} characters long`,
      );
    }

    if (username.length > UserAggregate.MAX_USERNAME_LENGTH) {
      throw new ValidationException(
        `User username cannot exceed ${UserAggregate.MAX_USERNAME_LENGTH} characters`,
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new ValidationException(
        'User username can only contain letters, numbers, and underscores',
      );
    }
  }

  private static validateDisplayName(displayName: string): void {
    if (!displayName) {
      throw new NotEmptyException('User display name');
    }

    if (displayName.length < UserAggregate.MIN_DISPLAY_NAME_LENGTH) {
      throw new ValidationException(
        `User display name must be at least ${UserAggregate.MIN_DISPLAY_NAME_LENGTH} characters long`,
      );
    }

    if (displayName.length > UserAggregate.MAX_DISPLAY_NAME_LENGTH) {
      throw new ValidationException(
        `User display name cannot exceed ${UserAggregate.MAX_DISPLAY_NAME_LENGTH} characters`,
      );
    }
  }

  /**
   * Factory method para crear un nuevo usuario
   */
  public static create(
    username: string,
    displayName: string,
    id?: string,
  ): UserAggregate {
    this.validateUsername(username);
    this.validateDisplayName(displayName);

    return new UserAggregate(
      id || randomUUID(),
      username,
      displayName,
      new Date(),
    );
  }

  /**
   * Factory para reconstituir un usuario desde persistencia
   */
  public static reconstitute(
    id: string,
    username: string,
    displayName: string,
    createdAt: Date,
  ): UserAggregate {
    return new UserAggregate(id, username, displayName, createdAt);
  }

  public hasUsername(username: string): boolean {
    return this.username === username;
  }

  public getId(): string {
    return this.id;
  }

  public getUsername(): string {
    return this.username;
  }

  public getDisplayName(): string {
    return this.displayName;
  }

  public getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  /**
   * Conversión a DTO para serialización o persistencia
   */
  public toDTO(): UserAggregateDTO {
    return {
      id: this.getId(),
      username: this.getUsername(),
      displayName: this.getDisplayName(),
      createdAt: this.getCreatedAt(),
    };
  }
}

export interface UserAggregateDTO {
  id: string;
  username: string;
  displayName: string;
  createdAt: Date;
}
