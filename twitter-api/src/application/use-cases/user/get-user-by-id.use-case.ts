import { Inject, Injectable } from '@nestjs/common';
import { UserDto } from '../../dtos/user.dto';
import { UserService } from 'src/domain/interfaces/service/user-service.interface';
import { USER_SERVICE } from 'src/domain/interfaces/service/service.tokens';
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
