import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MinioService } from 'nestjs-minio-client';

@Injectable()
export class MinioClientService {
  private readonly baseBucket;
  constructor(
    private readonly minio: MinioService,
    private configService: ConfigService,
  ) {
    this.baseBucket = this.configService.get<string>('MINIO_BUCKET_NAME');
    this.ensureBucketExists(this.baseBucket);
  }

  private async ensureBucketExists(bucketName: string): Promise<void> {
    const exists = await this.minio.client.bucketExists(bucketName);
    if (!exists) {
      await this.minio.client.makeBucket(bucketName, 'us-east-1');
    }
  }
}
