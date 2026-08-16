import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP exception filter.
 *
 * In Express you'd do this with an error-handling middleware:
 *   app.use((err, req, res, next) => { ... })
 *
 * NestJS uses "exception filters" instead. This one catches every
 * HttpException (validation errors, 404s, auth failures, etc.) and
 * formats the response into a consistent JSON shape:
 *
 *   {
 *     statusCode: 400,
 *     message: "Validation failed" | ["field must be a string"],
 *     error: "Bad Request",
 *     path: "/api/tasks",
 *     timestamp: "2024-..."
 *   }
 *
 * This is registered globally in main.ts via app.useGlobalFilters().
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res.message as string | string[]) || message;
        error = (res.error as string) || error;
      }
    } else {
      // Log unexpected (non-HTTP) errors for debugging
      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
