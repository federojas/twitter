import { Injectable, Inject } from '@nestjs/common';
import { UserAggregate } from '../aggregates/user/user.aggregate';
import { UserService } from '../interfaces/service/user-service.interface';
import { UserRepository } from '../interfaces/repository/user-repository.interface';
import { USER_REPOSITORY } from '../interfaces/repository/repository.tokens';
import {
  ConflictException,
  UserNotFoundException,
} from '../exceptions/domain.exceptions';

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(user: UserAggregate): Promise<UserAggregate> {
    const existingUser = await this.userRepository.existsByUsername(
      user.getUsername(),
    );

    if (existingUser) {
      throw new ConflictException(
        `User with username ${user.getUsername()} already exists`,
      );
    }

    await this.userRepository.create(user);
    return user;
  }

  async getUserById(userId: string): Promise<UserAggregate | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    return user;
  }

  async getUserByUsername(username: string): Promise<UserAggregate | null> {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw new UserNotFoundException(username);
    }

    return user;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    return !(await this.userRepository.existsByUsername(username));
  }
}
