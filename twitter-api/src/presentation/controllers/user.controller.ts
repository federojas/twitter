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
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/user/get-users.use-case';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';

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
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    return this.getUserByIdUseCase.execute(id);
  }
}
