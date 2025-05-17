import { randomUUID } from 'crypto';

export class TweetAggregate {
  private readonly id: string;
  private readonly content: string;
  private readonly userId: string;

  // Denormalized user data for read optimization
  private readonly username: string;
  private readonly userDisplayName: string;

  private readonly createdAt: Date;

  private constructor(
    id: string,
    content: string,
    userId: string,
    username: string,
    userDisplayName: string,
    createdAt: Date,
  ) {
    this.id = id;
    this.content = content;
    this.userId = userId;
    this.username = username;
    this.userDisplayName = userDisplayName;
    this.createdAt = createdAt;
  }

  static create(
    content: string,
    userId: string,
    username: string,
    userDisplayName: string,
  ): TweetAggregate {
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Tweet content cannot be empty');
    }

    if (content.length > 280) {
      throw new Error('Tweet content cannot exceed 280 characters');
    }

    return new TweetAggregate(
      randomUUID(),
      content,
      userId,
      username,
      userDisplayName,
      new Date(),
    );
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

  getUsername(): string {
    return this.username;
  }

  getUserDisplayName(): string {
    return this.userDisplayName;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  toDTO() {
    return {
      id: this.id,
      content: this.content,
      userId: this.userId,
      username: this.username,
      userDisplayName: this.userDisplayName,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
