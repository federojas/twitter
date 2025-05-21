import { Test, TestingModule } from '@nestjs/testing';
import { USER_SERVICE } from '../../../../../src/domain/interfaces/service/service.tokens';
import { UserAggregate } from '../../../../../src/domain/aggregates/user/user.aggregate';
import { GetUsersUseCase } from '../../../../../src/application/use-cases/user/get-users.use-case';
import {
  PaginatedResult,
  PaginationParams,
} from '../../../../../src/application/dtos/pagination.dto';

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;

  // Mock services
  const mockUserService = {
    getUsers: jest.fn(),
    getTotalUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersUseCase,
        {
          provide: USER_SERVICE,
          useValue: mockUserService,
        },
      ],
    }).compile();

    useCase = module.get<GetUsersUseCase>(GetUsersUseCase);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return a paginated list of users', async () => {
      // Arrange
      const pagination = new PaginationParams(1, 10);

      // Mock user aggregates
      const mockUsers = [
        {
          getId: () => 'user-1',
          getUsername: () => 'user1',
          getDisplayName: () => 'User One',
          toDTO: () => ({
            id: 'user-1',
            username: 'user1',
            displayName: 'User One',
          }),
        },
        {
          getId: () => 'user-2',
          getUsername: () => 'user2',
          getDisplayName: () => 'User Two',
          toDTO: () => ({
            id: 'user-2',
            username: 'user2',
            displayName: 'User Two',
          }),
        },
      ] as unknown as UserAggregate[];

      // Set up mock responses
      mockUserService.getUsers.mockResolvedValue(mockUsers);
      mockUserService.getTotalUsers.mockResolvedValue(2);

      // Act
      const result = await useCase.execute(pagination);

      // Assert
      expect(mockUserService.getUsers).toHaveBeenCalledWith(
        pagination.page,
        pagination.pageSize,
      );
      expect(mockUserService.getTotalUsers).toHaveBeenCalled();

      // Verify the returned paginated result
      expect(result).toBeInstanceOf(PaginatedResult);
      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(10);

      // Check user details
      expect(result.data[0].id).toBe('user-1');
      expect(result.data[0].username).toBe('user1');
      expect(result.data[0].displayName).toBe('User One');

      expect(result.data[1].id).toBe('user-2');
      expect(result.data[1].username).toBe('user2');
      expect(result.data[1].displayName).toBe('User Two');
    });

    it('should use default pagination if none provided', async () => {
      // Arrange
      const defaultPagination = new PaginationParams();

      // Mock empty users array
      mockUserService.getUsers.mockResolvedValue([]);
      mockUserService.getTotalUsers.mockResolvedValue(0);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockUserService.getUsers).toHaveBeenCalledWith(
        defaultPagination.page,
        defaultPagination.pageSize,
      );
      expect(mockUserService.getTotalUsers).toHaveBeenCalled();

      // Verify the returned paginated result uses default pagination
      expect(result.data).toEqual([]);
      expect(result.pagination.page).toBe(defaultPagination.page);
      expect(result.pagination.pageSize).toBe(defaultPagination.pageSize);
    });

    it('should handle empty user list', async () => {
      // Arrange
      const pagination = new PaginationParams(1, 10);

      // Mock empty users array
      mockUserService.getUsers.mockResolvedValue([]);
      mockUserService.getTotalUsers.mockResolvedValue(0);

      // Act
      const result = await useCase.execute(pagination);

      // Assert
      expect(mockUserService.getUsers).toHaveBeenCalledWith(
        pagination.page,
        pagination.pageSize,
      );
      expect(mockUserService.getTotalUsers).toHaveBeenCalled();

      // Verify the returned paginated result
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
