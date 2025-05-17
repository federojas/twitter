import { Injectable } from '@nestjs/common';
import { UserAggregate } from '../../../../domain/aggregates/user/user.aggregate';
import { UserRepository } from '../../../../domain/repository-interfaces/user-repository.interface';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  private readonly users: Map<string, UserAggregate> = new Map();
  private readonly usernameToId: Map<string, string> = new Map();

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

    this.users.set(id, user);
    this.usernameToId.set(username, id);
    return Promise.resolve();
  }

  async findAll(): Promise<UserAggregate[]> {
    return Promise.resolve(Array.from(this.users.values()));
  }

  async existsByUsername(username: string): Promise<boolean> {
    return Promise.resolve(this.usernameToId.has(username));
  }
}
