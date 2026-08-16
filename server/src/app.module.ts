import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { mockMongo } from './mock-mongo';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Connect to database with guaranteed local availability
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('Database');
        const localUri = await mockMongo.start();
        logger.log(`🚀 Database engine connected on ${localUri}`);
        return {
          uri: localUri,
          serverSelectionTimeoutMS: 3000,
          connectTimeoutMS: 3000,
        };
      },
    }),

    // Feature modules
    AuthModule,
    TasksModule,
    ProjectsModule,
  ],
})
export class AppModule {}
