import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ConflictException,
  DomainException,
  ForbiddenException,
  MethodNotAllowedException,
  ResourceNotFoundException,
  UnauthorizedException,
  UnimplementedException,
  ValidationException,
} from '../../domain/exceptions/domain.exceptions';
import { ErrorResponse } from '../response/error-response';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof ResourceNotFoundException) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof ValidationException) {
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof ConflictException) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
    } else if (exception instanceof ForbiddenException) {
      status = HttpStatus.FORBIDDEN;
    } else if (exception instanceof MethodNotAllowedException) {
      status = HttpStatus.METHOD_NOT_ALLOWED;
    } else if (exception instanceof UnimplementedException) {
      status = HttpStatus.NOT_IMPLEMENTED;
    }

    const errorResponse = ErrorResponse.fromMessage(
      exception.message,
      exception.name,
      status,
    );

    response.status(status).json(errorResponse);
  }
}
