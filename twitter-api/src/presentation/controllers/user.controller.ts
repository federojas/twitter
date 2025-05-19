import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateUserDto, UserDto } from '../../application/dtos/user.dto';
import { FollowUserDto } from '../../application/dtos/follow.dto';
import {
  PaginatedResult,
  PaginationParams,
} from '../../application/dtos/pagination.dto';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';
import { GetUsersUseCase } from '../../application/use-cases/user/get-users.use-case';
import { GetFollowersUseCase } from '../../application/use-cases/user/get-followers.use-case';
import { GetFollowingUseCase } from '../../application/use-cases/user/get-following.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-user-by-id.use-case';
import { AuthGuard } from '../guards/auth.guard';

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
    private readonly getUsersUseCase: GetUsersUseCase,
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
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get users with pagination' })
  @ApiResponse({ status: 401, description: 'Missing Authorization header' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/UserDto',
          },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            pageCount: { type: 'number' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
      },
    },
  })
  async getUsers(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<PaginatedResult<UserDto>> {
    const pagination = new PaginationParams(
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined,
    );

    return this.getUsersUseCase.execute(pagination);
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
