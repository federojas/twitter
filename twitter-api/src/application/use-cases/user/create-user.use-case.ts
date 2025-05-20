import { Inject, Injectable } from '@nestjs/common';
import { UserAggregate } from '../../../domain/aggregates/user/user.aggregate';
import { CreateUserDto, UserDto } from '../../dtos/user.dto';
import { UserService } from 'src/domain/interfaces/service/user-service.interface';
import { USER_SERVICE } from 'src/domain/interfaces/service/service.tokens';
import { ConflictException } from 'src/domain/exceptions/domain.exceptions';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserService,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<UserDto> {
    const isAvailable = await this.userService.isUsernameAvailable(
      createUserDto.username,
    );

    if (!isAvailable) {
      throw new ConflictException(
        `Username ${createUserDto.username} is already taken`,
      );
    }

    const userAggregate = UserAggregate.create(
      createUserDto.username,
      createUserDto.displayName,
    );

    await this.userService.createUser(userAggregate);

    return userAggregate.toDTO() as UserDto;
  }
}
