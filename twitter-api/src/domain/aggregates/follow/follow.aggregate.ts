import { randomUUID } from 'crypto';
import { ValidationException } from '../../exceptions/domain.exceptions';

/**
 * Follow Aggregate Root
 * Encapsula el aggregate de follows y todas sus reglas de negocio
 */
export class FollowAggregate {
  private readonly id: string;
  private readonly followerId: string;
  private readonly followedId: string;
  private readonly createdAt: Date;

  private constructor(
    id: string,
    followerId: string,
    followedId: string,
    createdAt: Date,
  ) {
    this.id = id;
    this.followerId = followerId;
    this.followedId = followedId;
    this.createdAt = createdAt;
  }

  static create(followerId: string, followedId: string): FollowAggregate {
    if (followerId === followedId) {
      throw new ValidationException('Users cannot follow themselves');
    }

    return new FollowAggregate(
      randomUUID(),
      followerId,
      followedId,
      new Date(),
    );
  }

  getId(): string {
    return this.id;
  }

  getFollowerId(): string {
    return this.followerId;
  }

  getFollowedId(): string {
    return this.followedId;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  /**
   * Conversión a DTO para serialización o persistencia
   */
  toDTO(): FollowAggregateDTO {
    return {
      id: this.id,
      followerId: this.followerId,
      followedId: this.followedId,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

export interface FollowAggregateDTO {
  id: string;
  followerId: string;
  followedId: string;
  createdAt: string;
}
