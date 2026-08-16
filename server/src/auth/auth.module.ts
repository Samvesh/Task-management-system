import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from './schemas/user.schema';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Auth module — wires together all auth-related pieces.
 *
 * This is the NestJS equivalent of:
 *   const User = require('./models/User');
 *   const authRoutes = require('./routes/auth');
 *   app.use('/auth', authRoutes);
 *
 * But it also handles dependency injection:
 * - MongooseModule.forFeature() registers the User model so it can be
 *   injected with @InjectModel(User.name) in any service within this module
 * - JwtModule.registerAsync() configures JWT signing with the secret from .env
 * - PassportModule registers Passport so strategies can be discovered
 * - JwtStrategy is listed as a provider so NestJS instantiates it and
 *   Passport can find it when JwtAuthGuard is used
 *
 * exports: [AuthService] makes AuthService available to other modules
 * that import AuthModule (e.g., if TasksModule needs to look up users).
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
