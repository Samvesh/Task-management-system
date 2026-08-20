import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Connect to MongoDB using MONGODB_URI from environment
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      }),
    }),

    // Feature modules
    AuthModule,
    TasksModule,
    ProjectsModule,
  ],
})
export class AppModule {}

