import { Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { MinioModule } from 'nestjs-minio-client';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [MinioClientService],
  exports: [MinioClientService],
  imports: [
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        endPoint: config.get<string>('MINIO_ENDPOINT'),
        port: 9000,
        useSSL: false,
        accessKey: config.get<string>('MINIO_ACCESSKEY'),
        secretKey: config.get<string>('MINIO_SECRETKEY'),
      }),
    }),
  ],
})
export class MinioClientModule {}
