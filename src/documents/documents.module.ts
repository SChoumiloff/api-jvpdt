import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { MinioClientModule } from 'src/minio-client/minio-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), MinioClientModule],
  providers: [DocumentsService],
  controllers: [DocumentsController]
})
export class DocumentsModule {}
