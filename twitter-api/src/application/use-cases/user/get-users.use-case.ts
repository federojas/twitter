import { Inject, Injectable } from '@nestjs/common';
import { UserDto } from '../../dtos/user.dto';
import { UserService } from 'src/domain/interfaces/service/user-service.interface';
import { USER_SERVICE } from 'src/domain/interfaces/service/service.tokens';
import { UserRepository } from 'src/domain/interfaces/repository/user-repository.interface';
import { USER_REPOSITORY } from 'src/domain/interfaces/repository/repository.tokens';
import { UserNotFoundException } from 'src/domain/exceptions/domain.exceptions';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserService,
  ) {}

  async execute(id: string): Promise<UserDto> {
    const userAggregate = await this.userService.getUserById(id);

    if (!userAggregate) {
      throw new UserNotFoundException(id);
    }

    return userAggregate.toDTO() as UserDto;
  }
}

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<UserDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => user.toDTO() as UserDto);
  }
}
