/**
 * Centralized configuration factory.
 *
 * NestJS's ConfigModule calls this function at startup and makes the
 * returned object available via ConfigService.get('key').
 *
 * Why a factory instead of raw process.env?
 * - Single place to rename/add env vars
 * - Type-safe access via ConfigService
 * - Default values documented in one spot
 */
export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ablespace',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
});
