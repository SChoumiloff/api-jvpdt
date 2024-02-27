import { BadRequestException, Body, Controller, Delete, FileTypeValidator, ForbiddenException, Get, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { Response } from 'express';
import { Document } from './entities/document.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { BufferedFile } from 'libs/common/src/dto/minio';
import { CreateDocumentDto, UpdateDocumentDto } from 'libs/common/src/dto/documents';
import { GetCurrentUser } from 'libs/common/src/decorators';
import { Role, User } from 'src/users/entities/user.entity';
import { AccessTokenGuard } from 'libs/common/src/guards';
import { Actions } from 'libs/common/src/enums/actions.enum';

@Controller('documents')
export class DocumentsController {

    constructor(private documentService: DocumentsService) {}

    @Get('')
    async findAll(@GetCurrentUser() currentUser: User) : Promise<Document[]> {
        return await this.documentService.listAllDocument();
    }

    @Get('active')
    async findAllActive() : Promise<Document[]> {
        return await this.findAllActive();
    }

    @Get('unactive')
    async findAllNotActive(@GetCurrentUser() currentUser: User) : Promise<Document[]> {
        return await this.documentService.listAllUnactiveDocument()
    }

    @Get('stream/:id')
    async streamDocument(@Param('id') id: string, 
                         @Res() res: Response,
                         @GetCurrentUser() user: User) {
        const file = await this.documentService.streamDocument(+id)
        file.pipe(res)
    }

    @Get(':id') 
    async getDocumentById(@Param('id') id: string, @GetCurrentUser() currentUser: User) {
        const doc: Document = await this.documentService.getDocument(+id)
        if (!doc) {
            throw new NotFoundException(`
                Le document ${id} n'existe pas
            `)
        }
        return doc
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async createDocument(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: 'application/pdf' }),
                ]
            })
        ) file: BufferedFile,
        @Body() dto: CreateDocumentDto,
        @GetCurrentUser() currentUser: User
    ) {
        return await this.documentService.createDocument(currentUser, dto, file)
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('file'))
    async updateDocument(
        @Param('id') id: string,
        @GetCurrentUser() currentUser: User,
        @Body() dto?: UpdateDocumentDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: 'application/pdf' }),
                ]
            })
        ) file?: BufferedFile,
    ) {
        const docResearch: Document = await this.documentService.getDocument(+id)
        if (dto && !file) {
            return await this.documentService.updateDocument(+id, currentUser, dto)
        }
        if (file && !dto) {
            return await this.documentService.updateDocument(+id, currentUser, null, file)
        }
        if (dto && file) {
            return await this.documentService.updateDocument(+id, currentUser, dto, file)

        }
        throw new BadRequestException(`
            Aucune modifications notifiées pour le document d'id ${id}
        `)
    }

    @Delete(':id')
    async removeDocument(
        @Param('id') id: string,
        @GetCurrentUser() user: User,
    ) {
        return this.documentService.removeDocument(+id)
    }
}
