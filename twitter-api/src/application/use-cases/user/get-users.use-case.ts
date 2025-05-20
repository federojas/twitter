import { Inject, Injectable } from '@nestjs/common';
import { UserDto } from '../../dtos/user.dto';
import { PaginatedResult, PaginationParams } from '../../dtos/pagination.dto';
import { UserService } from 'src/domain/interfaces/service/user-service.interface';
import { USER_SERVICE } from 'src/domain/interfaces/service/service.tokens';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserService,
  ) {}

  async execute(
    pagination: PaginationParams = new PaginationParams(),
  ): Promise<PaginatedResult<UserDto>> {
    const users = await this.userService.getUsers(
      pagination.page,
      pagination.pageSize,
    );

    const total = await this.userService.getTotalUsers();

    const userDtos = users.map((user) => user.toDTO() as UserDto);

    return new PaginatedResult<UserDto>(userDtos, total, pagination);
  }
}
