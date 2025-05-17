import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseFilters,
} from '@nestjs/common';
import { CreateUserDto, UserDto } from '../../application/dtos/user.dto';
import { FollowUserDto } from '../../application/dtos/follow.dto';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-users.use-case';
import {
  GetFollowersUseCase,
  GetFollowingUseCase,
} from '../../application/use-cases/follow/get-user-follows.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { UnimplementedException } from 'src/domain/exceptions/domain.exceptions';

/**
 * User Controller
 * Mapea API inputs a application use cases y use case outputs a API responses
 */
@Controller('users')
@UseFilters(DomainExceptionFilter)
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getFollowersUseCase: GetFollowersUseCase,
    private readonly getFollowingUseCase: GetFollowingUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get()
  async getUsers(): Promise<null> {
    throw new UnimplementedException(
      'Querying over all users is not implemented.',
    );

    return Promise.resolve(null);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    return this.getUserByIdUseCase.execute(id);
  }

  @Get(':id/followers')
  async getUserFollowers(@Param('id') id: string): Promise<FollowUserDto[]> {
    return this.getFollowersUseCase.execute(id);
  }

  @Get(':id/following')
  async getUserFollowing(@Param('id') id: string): Promise<FollowUserDto[]> {
    return this.getFollowingUseCase.execute(id);
  }
}
