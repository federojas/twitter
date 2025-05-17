import { randomUUID } from 'crypto';

/**
 * Tweet Aggregate Root
 * Encapsula el aggregate de tweets y todas sus reglas de negocio
 */
export class TweetAggregate {
  private readonly id: string;
  private readonly content: string;
  private readonly userId: string;
  private readonly createdAt: Date;

  private constructor(
    id: string,
    content: string,
    userId: string,
    createdAt: Date,
  ) {
    this.id = id;
    this.content = content;
    this.userId = userId;
    this.createdAt = createdAt;
  }

  static create(content: string, userId: string): TweetAggregate {
    if (!content || content.trim().length === 0) {
      throw new Error('Tweet content cannot be empty');
    }

    if (content.length > 280) {
      throw new Error('Tweet content cannot exceed 280 characters');
    }

    return new TweetAggregate(randomUUID(), content, userId, new Date());
  }

  getId(): string {
    return this.id;
  }

  getContent(): string {
    return this.content;
  }

  getUserId(): string {
    return this.userId;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  /**
   * Conversión a DTO para serialización o persistencia
   */
  toDTO(): TweetAggregateDTO {
    return {
      id: this.id,
      content: this.content,
      userId: this.userId,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

export interface TweetAggregateDTO {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}
