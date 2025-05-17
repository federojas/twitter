import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../../domain/repositories/user-repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/repository.tokens';
import { UserDto } from '../../dtos/user.dto';
import { ResourceNotFoundException } from 'src/domain/exceptions/domain.exceptions';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<UserDto> {
    const userAggregate = await this.userRepository.findById(id);
    if (!userAggregate) {
      throw new ResourceNotFoundException('User', id);
    }

    return userAggregate.toDTO();
  }
}
