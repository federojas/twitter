import { UserAggregate } from '../../aggregates/user/user.aggregate';

export interface UserService {
  createUser(user: UserAggregate): Promise<UserAggregate>;

  getUserById(userId: string): Promise<UserAggregate | null>;

  getUserByUsername(username: string): Promise<UserAggregate | null>;

  isUsernameAvailable(username: string): Promise<boolean>;
}
