/**
 * Clase base para manejar excepciones de dominio
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

////////////////////////////////////////////////////////////

// 400

/**
 * Error de validación (datos no válidos, bad request)
 */
export class ValidationException extends DomainException {
  constructor(message?: string) {
    super(message || 'Bad request.');
  }
}

/**
 * Error de recurso no vacío (no puede estar vacío)
 */
export class NotEmptyException extends ValidationException {
  constructor(resource?: string) {
    super(
      resource ? `${resource} cannot be empty` : 'Resource cannot be empty',
    );
  }
}

////////////////////////////////////////////////////////////

// 401

/**
 * Request no autenticado (no se ha proporcionado autenticación)
 */
export class UnauthorizedException extends DomainException {
  constructor(message?: string) {
    super(message || 'Unauthorized request.');
  }
}

/**
 * Authorization header no presente
 */
export class MissingAuthorizationHeaderException extends UnauthorizedException {
  constructor() {
    super('Missing Authorization header');
  }
}

////////////////////////////////////////////////////////////

// 403

/**
 * Error de acceso denegado (no tiene permisos / no está autorizado)
 */
export class ForbiddenException extends DomainException {
  constructor(message?: string) {
    super(message || 'Forbidden.');
  }
}

////////////////////////////////////////////////////////////

// 405

/**
 * Error de método no permitido
 */
export class MethodNotAllowedException extends DomainException {
  constructor(message?: string) {
    super(message || 'Method not allowed.');
  }
}

////////////////////////////////////////////////////////////

// 404

/**
 * Recurso no encontrado (no existe)
 */
export class ResourceNotFoundException extends DomainException {
  constructor(resource?: string, id?: string) {
    super(
      id
        ? `${resource ? `${resource} with ID ${id} not found` : `Resource with ID ${id} not found`}`
        : `${resource ? `${resource} not found` : 'Resource not found'}`,
    );
  }
}

/**
 * Usuario no encontrado (no existe)
 */
export class UserNotFoundException extends ResourceNotFoundException {
  constructor(id?: string) {
    super('User', id);
  }
}

/**
 * Usuario no encontrado (no existe)
 */
export class TweetNotFoundException extends ResourceNotFoundException {
  constructor(id?: string) {
    super('Tweet', id);
  }
}

/**
 * Usuario no encontrado (no existe)
 */
export class FollowNotFoundException extends ResourceNotFoundException {
  constructor(id?: string) {
    super('Follow', id);
  }
}

////////////////////////////////////////////////////////////

// 409

/**
 * Error de conflicto (recurso ya existe)
 */
export class ConflictException extends DomainException {
  constructor(message?: string) {
    super(message || 'Conflict.');
  }
}

////////////////////////////////////////////////////////////

// 500

/**
 * Error de servidor (error interno del servidor)
 */
export class ServerException extends DomainException {
  constructor(message?: string) {
    super(message || 'Internal server error.');
  }
}

////////////////////////////////////////////////////////////

// 501

/**
 * Metodo no implementado (podria ser implementado en el futuro pero no es requerido para el MVP)
 */
export class UnimplementedException extends DomainException {
  constructor(message?: string) {
    super(message || 'Method not implemented.');
  }
}

////////////////////////////////////////////////////////////
