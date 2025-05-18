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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateUserDto, UserDto } from '../../application/dtos/user.dto';
import { FollowUserDto } from '../../application/dtos/follow.dto';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-users.use-case';
import { GetFollowersUseCase } from '../../application/use-cases/user/get-followers.use-case';
import { GetFollowingUseCase } from '../../application/use-cases/user/get-following.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { UnimplementedException } from 'src/domain/exceptions/domain.exceptions';

/**
 * User Controller
 * Mapea API inputs a application use cases y use case outputs a API responses
 */
@ApiTags('users')
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
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 501, description: 'Not implemented' })
  async getUsers(): Promise<null> {
    throw new UnimplementedException(
      'Querying over all users is not implemented.',
    );

    return Promise.resolve(null);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    return this.getUserByIdUseCase.execute(id);
  }

  @Get(':id/followers')
  @ApiOperation({ summary: 'Get user followers' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Followers found',
    type: [FollowUserDto],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserFollowers(@Param('id') id: string): Promise<FollowUserDto[]> {
    return this.getFollowersUseCase.execute(id);
  }

  @Get(':id/following')
  @ApiOperation({ summary: 'Get users that this user is following' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Following users found',
    type: [FollowUserDto],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserFollowing(@Param('id') id: string): Promise<FollowUserDto[]> {
    return this.getFollowingUseCase.execute(id);
  }
}
