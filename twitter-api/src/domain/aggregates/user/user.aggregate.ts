import { randomUUID } from 'crypto';

/**
 * User Aggregate Root
 * Encapsula el aggregate de usuario y todas sus reglas de negocio
 */
export class UserAggregate {
  private readonly id: string;
  private readonly username: string;
  private readonly displayName: string;
  private readonly createdAt: Date;

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

  /**
   * Factory method para crear un nuevo usuario
   */
  public static create(
    username: string,
    displayName: string,
    id?: string,
  ): UserAggregate {
    if (!username) {
      throw new Error('Username cannot be empty');
    }

    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (username.length > 20) {
      throw new Error('Username cannot exceed 20 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error(
        'Username can only contain letters, numbers, and underscores',
      );
    }

    if (!displayName) {
      throw new Error('Display name cannot be empty');
    }

    if (displayName.length < 3) {
      throw new Error('Display name must be at least 3 characters long');
    }

    if (displayName.length > 50) {
      throw new Error('Display name cannot exceed 50 characters');
    }

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
