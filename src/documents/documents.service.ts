import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto, UpdateDocumentDto } from 'libs/common/src/dto/documents';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { Document } from './entities/document.entity';
import { BufferedFile } from 'libs/common/src/dto/minio';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Readable } from 'stream';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class DocumentsService {
    constructor(@InjectRepository(Document) private documentRepository: Repository<Document>,
        private readonly minioService: MinioClientService) {}

    async createDocument(user: User, dto: CreateDocumentDto, file: BufferedFile) : Promise<Document> {
        try {
            const filepath: string = await this.minioService.uploadDocument(file);
            const doc: Document = this.documentRepository.create();
            Object.assign(doc, dto);
            doc.author = user;
            doc.documentPath = filepath
            return await this.documentRepository.save(doc);
        } catch(error) {
            throw new InternalServerErrorException(`Impossible de charger le fichier`)
        }
    }

    async updateDocument(id: number, currentUser: User, dto?: UpdateDocumentDto, file?: BufferedFile) {
        try {
            const doc: Document = await this.documentRepository.findOneBy({
                id: id
            })
            if (!doc) {
                throw new NotFoundException(`
                    Ce document n'existe pas
                `)
            }
            if (dto) {
                Object.assign(doc, dto);
            }
            if (file) {
                await this.minioService.deleteDocument(doc.documentPath)
                const newFilename: string = await this.minioService.uploadDocument(file);
                doc.documentPath = newFilename;
            }
            doc.lastModifier = currentUser
            return await this.documentRepository.save(doc);
        } catch (error) {
            throw new InternalServerErrorException(`Impossible de charger le fichier`)
        }
    }

    async removeDocument(id: number) : Promise<void> {
        const doc: Document = await this.documentRepository.findOneBy({
            id: id
        })
        if (!doc) {
            throw new NotFoundException(`
                Le document d'id ${id} n'existe pas
            `)
        }
        this.documentRepository.remove(doc);
    }

    async streamDocument(id: number) : Promise<Readable> {
        const doc: Document = await this.getDocument(id);
        if (!doc) {
            throw new NotFoundException(`
                Le document d'id ${id} n'existe pas
            `)
        }
        return await this.minioService.findObject(doc.documentPath)
    }

    async listAllActiveDocument() : Promise<Document[]> {
        return await this.documentRepository.findBy({
            isActiveDoc: true
        })
    }

    async listAllUnactiveDocument() : Promise<Document[]> {
        return await this.documentRepository.findBy({
            isActiveDoc: false
        })
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
