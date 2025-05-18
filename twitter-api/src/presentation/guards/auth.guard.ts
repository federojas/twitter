import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { MissingAuthorizationHeaderException } from '../../domain/exceptions/domain.exceptions';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new MissingAuthorizationHeaderException();
    }

    const userId = authorization.startsWith('Bearer ')
      ? authorization.substring(7).trim()
      : authorization.trim();

    request['userId'] = userId;

    return true;
  }
}
