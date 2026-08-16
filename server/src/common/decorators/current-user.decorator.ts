import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom parameter decorator to extract the authenticated user from the request.
 *
 * In Express, after your auth middleware sets `req.user`, you'd access it
 * directly: `const user = req.user;`
 *
 * In NestJS, custom parameter decorators let you do the same thing but
 * with cleaner, more explicit controller signatures:
 *
 *   @Get('me')
 *   getMe(@CurrentUser() user: UserDocument) {
 *     return user;
 *   }
 *
 * The decorator extracts `request.user` (set by Passport's JWT strategy)
 * and optionally a specific property if you pass a key:
 *
 *   @Get('me')
 *   getMe(@CurrentUser('_id') userId: string) {
 *     return userId;
 *   }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a specific property was requested (e.g., @CurrentUser('_id')),
    // return just that property. Otherwise return the full user object.
    return data ? user?.[data] : user;
  },
);
