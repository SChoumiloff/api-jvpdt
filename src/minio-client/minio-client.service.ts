import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MinioService } from 'nestjs-minio-client';
import { BufferedFile } from 'libs/common/src/dto/minio/file.model';
import internal, { Readable } from 'stream';

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

  async uploadDocument(file: BufferedFile) : Promise<string> {
    if (!file.mimetype.includes('pdf')) {
      throw new BadRequestException(`Seuls les fichiers pdf sont acceptés`)
    }
    let tmpFilename: string = Date.now().toString();
    let filename: string = `${tmpFilename}_${file.originalname}`;
    this.minio.client.putObject(this.baseBucket, filename, file.buffer, function(err, res) {
      if (err) throw new InternalServerErrorException(`Impossible d'uploader le fichier`)
    })
  return filename;
  }

  async findObject(filename: string) : Promise<Readable> {
    const objectsList : string[] = await this.listAllDocuments();
    if (objectsList.includes(filename)) {
      const file : internal.Readable = await this.minio.client.getObject(this.baseBucket, filename)
      file.on('error', error => {
        throw new InternalServerErrorException(`Impossible de récupérer le document : ${filename}`)
      });
      return file
    } else {
      throw new NotFoundException(`Aucun fichier trouvé avec le nom :  ${filename}`);
    }
  }

  async listAllDocuments() : Promise<string[]> {
    const stream = this.minio.client.listObjectsV2(this.baseBucket, '', true);

    const objectNames: string[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        objectNames.push(obj.name);
      });
      stream.on('end', () => {
        resolve(objectNames);
      });
      stream.on('error', (err) => {
        reject(err);
      });
    });
  }

  async deleteDocument(filename: string) : Promise<void> {
    await this.minio.client.removeObject(this.baseBucket, filename)
  }
}
