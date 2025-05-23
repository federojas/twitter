import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { LinkGenerator, ApiResource } from '../utils/link-generator';
import { PaginatedResult } from '../../application/dtos/pagination.dto';
import {
  isTweetDto,
  isUserDto,
  isFollowDto,
} from '../../application/utils/dto-type-guards';

type ApiResponse =
  | ApiResource
  | ApiResource[]
  | PaginatedResult<ApiResource>
  | PaginatedResultWithLinks<ApiResource>
  | null
  | undefined;

interface PaginatedResultWithLinks<T> extends PaginatedResult<T> {
  links: {
    self: string;
    first: string;
    prev?: string;
    next?: string;
    last: string;
  };
}

@Injectable()
export class HateoasInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse> {
    const originalQueryParams = this.extractQueryParams(context);
    const originalPath = this.extractPath(context);

    return next.handle().pipe(
      map((data: ApiResponse) => {
        if (data === null || data === undefined) {
          return data;
        }

        if (data instanceof PaginatedResult) {
          return this.transformPaginatedResult(
            data,
            originalQueryParams,
            originalPath,
          );
        }

        if (Array.isArray(data)) {
          return LinkGenerator.enhanceResourcesWithLinks(data) as ApiResource[];
        }

        return LinkGenerator.enhanceResourceWithLinks(data) as ApiResource;
      }),
    );
  }

  private extractPath(context: ExecutionContext): string {
    try {
      const req = context.switchToHttp().getRequest<Request>();
      const fullUrl = req?.originalUrl || req?.url || req?.path || '/';
      const path = fullUrl.split('?')[0];
      return path || '/';
    } catch {
      return '/';
    }
  }

  private extractQueryParams(
    context: ExecutionContext,
  ): Record<string, string> {
    const result: Record<string, string> = {};

    try {
      const req = context.switchToHttp().getRequest<Request>();

      if (req && req.query) {
        Object.entries(req.query).forEach(([key, value]) => {
          if (key !== 'page' && key !== 'pageSize' && value !== undefined) {
            result[key] =
              typeof value === 'object' ? JSON.stringify(value) : String(value);
          }
        });
      }
    } catch {
      return result;
    }

    return result;
  }

  private transformPaginatedResult<T extends ApiResource>(
    result: PaginatedResult<T>,
    originalQueryParams: Record<string, string> = {},
    originalPath: string = '/',
  ): PaginatedResultWithLinks<T> {
    const transformedData = LinkGenerator.enhanceResourcesWithLinks(
      result.data,
    ) as T[];

    let resourcePath = originalPath;

    if (originalPath === '/' && transformedData.length > 0) {
      const firstItem = transformedData[0];

      if (isTweetDto(firstItem)) {
        resourcePath = '/tweets';
      } else if (isUserDto(firstItem)) {
        resourcePath = '/users';
      } else if (isFollowDto(firstItem)) {
        resourcePath = '/follows';
      }
    }

    const { page, pageSize, pageCount } = result.pagination;

    const links = LinkGenerator.generatePaginationLinks(
      resourcePath,
      page,
      pageSize,
      pageCount,
      originalQueryParams,
    );

    return {
      ...result,
      data: transformedData,
      links,
    };
  }
}
