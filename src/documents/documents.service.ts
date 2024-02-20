import { Injectable } from '@nestjs/common';
import { MinioClientService } from 'src/minio-client/minio-client.service';

@Injectable()
export class DocumentsService {
    constructor(private readonly minioService: MinioClientService) {}

    async createDocument() {}

    async createDocuments() {}

    async deleteDocument() {}

    async updateDocument() {}

    async getDocument() {}

    async listDocument() {}

    async listAllDocument() {}
}
