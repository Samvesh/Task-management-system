import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for the "Continue as Guest" login flow.
 *
 * DTOs (Data Transfer Objects) are classes with validation decorators.
 * NestJS's ValidationPipe (set up in main.ts) automatically validates
 * incoming request bodies against these decorators BEFORE your
 * controller method runs.
 *
 * In Express, you'd use express-validator or Joi:
 *   router.post('/guest', body('displayName').optional().isString(), ...)
 *
 * NestJS uses class-validator decorators on a class instead, which is
 * more type-safe and self-documenting.
 *
 * For guest login, we allow an optional display name. If not provided,
 * the service will generate one (e.g., "Guest_abc123").
 */
export class GuestLoginDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;
}
