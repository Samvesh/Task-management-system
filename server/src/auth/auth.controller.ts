import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GuestLoginDto } from './dto/guest-login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from './schemas/user.schema';

/**
 * Auth controller — HTTP endpoints for authentication.
 *
 * NestJS controllers are like Express route files but with decorators
 * instead of router.get()/router.post(). The key differences:
 *
 * 1. @Controller('auth') sets the route prefix → all routes start with /auth
 *    (plus the global /api prefix we set in main.ts)
 *
 * 2. @Post('guest') is like router.post('/guest', handler)
 *
 * 3. @Body() is like req.body — but NestJS auto-validates it against the DTO
 *    class before your method runs (thanks to the global ValidationPipe)
 *
 * 4. @UseGuards(JwtAuthGuard) is like applying auth middleware to specific routes
 *
 * 5. No business logic here — everything is delegated to AuthService.
 *    Controllers should only handle HTTP concerns (status codes, headers, etc.)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/guest
   *
   * "Continue as Guest" — creates a guest user and returns a JWT.
   * No credentials required.
   */
  @Post('guest')
  async guestLogin(@Body() dto: GuestLoginDto) {
    const result = await this.authService.guestLogin(dto);
    return {
      accessToken: result.accessToken,
      user: {
        _id: result.user._id,
        fullName: result.user.fullName,
        isGuest: result.user.isGuest,
      },
    };
  }

  /**
   * GET /api/auth/me
   *
   * Returns the currently authenticated user's profile.
   * Requires a valid JWT in the Authorization header.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: UserDocument) {
    return {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      title: user.title,
      avatar: user.avatar,
      isGuest: user.isGuest,
    };
  }
}
