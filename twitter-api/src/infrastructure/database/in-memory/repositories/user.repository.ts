import { Injectable } from '@nestjs/common';
import { UserAggregate } from '../../../../domain/aggregates/user/user.aggregate';
import { UserRepository } from '../../../../domain/repositories/user-repository.interface';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  // Primary storage
  private readonly users: Map<string, UserAggregate> = new Map();

  // Read-optimized indexes
  private readonly usernameToId: Map<string, string> = new Map();
  private readonly displayNameToIds: Map<string, Set<string>> = new Map();
  private readonly sortedByCreationTime: string[] = []; // Sorted user IDs by creation time

  async findById(id: string): Promise<UserAggregate | null> {
    return Promise.resolve(this.users.get(id) || null);
  }

  async findByUsername(username: string): Promise<UserAggregate | null> {
    const id = this.usernameToId.get(username);
    if (!id) {
      return Promise.resolve(null);
    }
    return Promise.resolve(this.users.get(id) || null);
  }

  async create(user: UserAggregate): Promise<void> {
    const id = user.getId();
    const username = user.getUsername();
    const displayName = user.getDisplayName();

    // Update primary storage
    this.users.set(id, user);

    // Update indexes
    this.usernameToId.set(username, id);

    // Update display name index
    let displayNameIds = this.displayNameToIds.get(displayName);
    if (!displayNameIds) {
      displayNameIds = new Set<string>();
      this.displayNameToIds.set(displayName, displayNameIds);
    }
    displayNameIds.add(id);

    // Add to sorted list
    this.sortedByCreationTime.unshift(id); // Add to beginning (newest first)

    return Promise.resolve();
  }

  async findAll(): Promise<UserAggregate[]> {
    return Promise.resolve(Array.from(this.users.values()));
  }

  async existsByUsername(username: string): Promise<boolean> {
    return Promise.resolve(this.usernameToId.has(username));
  }

  // New optimized read methods

  async findByDisplayName(displayName: string): Promise<UserAggregate[]> {
    const ids = this.displayNameToIds.get(displayName);
    if (!ids) {
      return Promise.resolve([]);
    }

    const users: UserAggregate[] = [];
    for (const id of ids) {
      const user = this.users.get(id);
      if (user) {
        users.push(user);
      }
    }

    return Promise.resolve(users);
  }

  async findRecentUsers(limit: number): Promise<UserAggregate[]> {
    const count = Math.min(limit, this.sortedByCreationTime.length);
    const users: UserAggregate[] = [];

    for (let i = 0; i < count; i++) {
      const id = this.sortedByCreationTime[i];
      const user = this.users.get(id);
      if (user) {
        users.push(user);
      }
    }

    return Promise.resolve(users);
  }
}
