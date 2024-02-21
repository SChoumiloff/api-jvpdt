import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto, UpdateDocumentDto } from 'libs/common/src/dto/documents';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { Document } from './entities/document.entity';
import { BufferedFile } from 'libs/common/src/dto/minio';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DocumentsService {
    constructor(@InjectRepository(Document) private documentRepository: Repository<Document>,
        private readonly minioService: MinioClientService) {}

    async createDocument(dto: CreateDocumentDto, file: BufferedFile) : Promise<Document> {
        try {
            const fileName: string = await this.minioService.uploadDocument(file);
            const doc: Document = await this.documentRepository.create(dto);
            return await this.documentRepository.save(doc);
        } catch(error) {
            throw new InternalServerErrorException(`Impossible de charger le fichier`)
        }
    }

    async deleteDocument(id: number) : Promise<void> {
        try {
            const doc: Document = await this.getDocument(id);
            if (!doc) {
                throw new NotFoundException(`Le document d'id : ${id} n'existe pas`);
            }
            await this.minioService.deleteDocument(doc.documentPath);
            await this.documentRepository.remove(doc);
        } catch (error) {
            throw new InternalServerErrorException(`Impossible de supprimer le document d'id : ${id}`)
        }
    }

    async updateDocument(id: number, dto: UpdateDocumentDto, file?: BufferedFile) : Promise<Document> {
        const doc: Document =  await this.getDocument(id);
        if (!doc) {
            throw new NotFoundException(`Impossible de trouver le document d'id: ${id}`)
        } else {
            if (file) {
                await this.minioService.deleteDocument(doc.documentPath);
                const newName: string = await this.minioService.uploadDocument(file);
                doc.documentPath = newName;
            } 
            Object.assign(doc, dto)
            return this.documentRepository.save(doc)
        }
    }

    async getDocument(id): Promise<Document> {
        return await this.documentRepository.findOneBy({id: id})
    }

    async getDocumentByName(filename: string): Promise<Document> {
        return await this.documentRepository.findOneBy({documentName: filename})
    }

    async getEnableDocuments(): Promise<Document[]> {
        return await this.documentRepository.findBy({isActiveDoc: true})
    }

    async listAllDocument(): Promise<Document[]> {
        return await this.documentRepository.find();
    }
}
