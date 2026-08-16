import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AuthService } from '../auth.service';

/**
 * Passport JWT strategy for NestJS.
 *
 * This is the equivalent of passport.use(new JwtStrategy(...)) in Express.
 *
 * How it works:
 * 1. Client sends request with `Authorization: Bearer <token>` header.
 * 2. Passport extracts the token from the header.
 * 3. Passport verifies the signature using the JWT_SECRET.
 * 4. If valid, the `validate()` method below is called with the decoded payload.
 * 5. Whatever `validate()` returns becomes `request.user`.
 *
 * The JwtAuthGuard (in common/guards/) triggers this strategy.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * Called after the JWT is verified. The returned value is attached to
   * `request.user` and available via @CurrentUser() decorator.
   *
   * We look up the full user document from the DB so that controllers
   * have access to all user fields, not just the JWT payload.
   */
  async validate(payload: JwtPayload) {
    return this.authService.validateUser(payload.sub);
  }
}
