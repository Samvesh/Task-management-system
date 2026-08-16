import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT authentication guard.
 *
 * In Express, you'd write middleware like:
 *   const authMiddleware = (req, res, next) => {
 *     const token = req.headers.authorization?.split(' ')[1];
 *     const payload = jwt.verify(token, secret);
 *     req.user = payload;
 *     next();
 *   };
 *
 * NestJS wraps this in a "guard" — a class that decides whether a
 * request should proceed. By extending AuthGuard('jwt'), we delegate
 * to Passport's JWT strategy (defined in auth/strategies/jwt.strategy.ts).
 *
 * Usage on a controller method:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('profile')
 *   getProfile(@CurrentUser() user) { ... }
 *
 * Or on an entire controller:
 *   @UseGuards(JwtAuthGuard)
 *   @Controller('tasks')
 *   export class TasksController { ... }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
