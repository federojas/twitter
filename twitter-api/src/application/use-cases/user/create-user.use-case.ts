import { Inject, Injectable } from '@nestjs/common';
import { UserAggregate } from '../../../domain/aggregates/user/user.aggregate';
import { UserRepository } from '../../../domain/repository-interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../../domain/repository-interfaces/repository.tokens';
import { CreateUserDto, UserDto } from '../../dtos/user.dto';
import { ConflictException } from 'src/domain/exceptions/domain.exceptions';
import { LinkGenerator } from 'src/application/utils/link-generator';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<UserDto> {
    const usernameExists = await this.userRepository.existsByUsername(
      createUserDto.username,
    );

    if (usernameExists) {
      throw new ConflictException(
        `User with username ${createUserDto.username} already exists`,
      );
    }

    const userAggregate = UserAggregate.create(
      createUserDto.username,
      createUserDto.displayName,
    );

    await this.userRepository.create(userAggregate);

    return LinkGenerator.enhanceUserWithLinks(userAggregate.toDTO() as UserDto);
  }
}
