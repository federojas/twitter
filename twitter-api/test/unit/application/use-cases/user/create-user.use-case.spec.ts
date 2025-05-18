import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '../../../../../src/application/use-cases/user/create-user.use-case';
import { UserService } from '../../../../../src/domain/interfaces/service/user-service.interface';
import { USER_SERVICE } from '../../../../../src/domain/interfaces/service/service.tokens';
import { UserAggregate } from '../../../../../src/domain/aggregates/user/user.aggregate';
import {
  CreateUserDto,
  UserDto,
} from '../../../../../src/application/dtos/user.dto';
import { ConflictException } from '../../../../../src/domain/exceptions/domain.exceptions';
import { LinkGenerator } from '../../../../../src/application/utils/link-generator';

// Mock the LinkGenerator utility
jest.mock('../../../../../src/application/utils/link-generator', () => ({
  LinkGenerator: {
    enhanceUserWithLinks: jest.fn(
      (userDto: UserDto): UserDto & { _links: any } => ({
        ...userDto,
        _links: {
          self: { href: `/users/${userDto.id}` },
          tweets: { href: `/users/${userDto.id}/tweets` },
          followers: { href: `/users/${userDto.id}/followers` },
          following: { href: `/users/${userDto.id}/following` },
        },
      }),
    ),
  },
}));

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: UserService;

  // Mock user service
  const mockUserService = {
    isUsernameAvailable: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: USER_SERVICE,
          useValue: mockUserService,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userService = module.get<UserService>(USER_SERVICE);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create a user successfully when username is available', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        displayName: 'New User',
      };

      // Mock the service responses
      mockUserService.isUsernameAvailable.mockResolvedValue(true);

      // Spy on UserAggregate.create
      const createSpy = jest.spyOn(UserAggregate, 'create');
      const mockUser = UserAggregate.create(
        createUserDto.username,
        createUserDto.displayName,
        'mocked-id-123',
      );
      createSpy.mockReturnValue(mockUser);

      // Act
      const result = await useCase.execute(createUserDto);

      // Assert
      expect(mockUserService.isUsernameAvailable).toHaveBeenCalledWith(
        createUserDto.username,
      );
      expect(createSpy).toHaveBeenCalledWith(
        createUserDto.username,
        createUserDto.displayName,
      );
      expect(mockUserService.createUser).toHaveBeenCalledWith(mockUser);

      // Verify the returned DTO has the expected properties
      expect(result).toEqual({
        id: mockUser.getId(),
        username: createUserDto.username,
        displayName: createUserDto.displayName,
        createdAt: mockUser.getCreatedAt(),
        _links: {
          self: { href: `/users/${mockUser.getId()}` },
          tweets: { href: `/users/${mockUser.getId()}/tweets` },
          followers: { href: `/users/${mockUser.getId()}/followers` },
          following: { href: `/users/${mockUser.getId()}/following` },
        },
      });

      // Verify LinkGenerator was called
      expect(LinkGenerator.enhanceUserWithLinks).toHaveBeenCalled();
    });

    it('should throw ConflictException when username already exists', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        displayName: 'Existing User',
      };

      // Mock username check to return false (username exists)
      mockUserService.isUsernameAvailable.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        new ConflictException(
          `User with username ${createUserDto.username} already exists`,
        ),
      );

      // Verify service was called but user never created
      expect(mockUserService.isUsernameAvailable).toHaveBeenCalledWith(
        createUserDto.username,
      );
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });
  });
});
