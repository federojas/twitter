/**
 * Data Transfer Object para respuestas paginadas
 */
export class PaginationParams {
  page: number;
  pageSize: number;

  static readonly DEFAULT_PAGE = 1;
  static readonly MAX_PAGE_SIZE = 100;
  static readonly MIN_PAGE_SIZE = 1;
  static readonly DEFAULT_PAGE_SIZE = 10;
  static readonly FIRST_PAGE = 1;

  constructor(
    page: number = PaginationParams.DEFAULT_PAGE,
    pageSize: number = PaginationParams.DEFAULT_PAGE_SIZE,
  ) {
    this.page =
      page < PaginationParams.FIRST_PAGE ? PaginationParams.DEFAULT_PAGE : page;
    this.pageSize =
      pageSize < PaginationParams.MIN_PAGE_SIZE
        ? PaginationParams.DEFAULT_PAGE_SIZE
        : pageSize > PaginationParams.MAX_PAGE_SIZE
          ? PaginationParams.MAX_PAGE_SIZE
          : pageSize;
  }
}

export class PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  constructor(data: T[], total: number, pagination: PaginationParams) {
    const { page, pageSize } = pagination;
    const pageCount = Math.ceil(total / pageSize);

    this.data = data;
    this.pagination = {
      total,
      page,
      pageSize,
      pageCount,
      hasNextPage: page < pageCount,
      hasPrevPage: page > PaginationParams.FIRST_PAGE,
    };
  }
}
