import { Inject, Injectable } from '@nestjs/common';
import { UserAggregate } from '../../../domain/aggregates/user/user.aggregate';
import { CreateUserDto, UserDto } from '../../dtos/user.dto';
import { LinkGenerator } from 'src/application/utils/link-generator';
import { UserService } from 'src/domain/interfaces/service/user-service.interface';
import { USER_SERVICE } from 'src/domain/interfaces/service/service.tokens';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserService,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<UserDto> {
    const isUsernameAvailable = await this.userService.isUsernameAvailable(
      createUserDto.username,
    );

    if (!isUsernameAvailable) {
      throw new Error(
        `User with username ${createUserDto.username} already exists`,
      );
    }

    const userAggregate = UserAggregate.create(
      createUserDto.username,
      createUserDto.displayName,
    );

    await this.userService.createUser(userAggregate);

    return LinkGenerator.enhanceUserWithLinks(userAggregate.toDTO() as UserDto);
  }
}
