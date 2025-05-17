import { UserAggregate } from '../aggregates/user/user.aggregate';

export interface UserRepository {
  findById(id: string): Promise<UserAggregate | null>;

  findByUsername(username: string): Promise<UserAggregate | null>;

  findAll(): Promise<UserAggregate[]>;

  create(user: UserAggregate): Promise<void>;

  existsByUsername(username: string): Promise<boolean>;

  // Read-optimized methods
  findByDisplayName(displayName: string): Promise<UserAggregate[]>;
  findRecentUsers(limit: number): Promise<UserAggregate[]>;
}
