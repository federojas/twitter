/**
 * Clase para crear respuestas de error
 * Matchea con el formato de error de NestJS
 */
export class ErrorResponse {
  constructor(
    public readonly message: string[],
    public readonly error: string,
    public readonly statusCode: number,
  ) {}

  static fromMessage(
    message: string,
    error: string,
    statusCode: number,
  ): ErrorResponse {
    return new ErrorResponse([message], error, statusCode);
  }
}
