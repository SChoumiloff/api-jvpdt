import { Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { MinioClientService } from "./minio-client.service";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { BufferedFile } from "libs/common/src/dto/minio/file.model";

@Controller('files')
export class MinioClientController {

    constructor(private minioClientService: MinioClientService) {}

    @Get(':filename')
    async getFile(@Param('filename') filename: string, @Res() res: Response) {
        const file =  await this.minioClientService.findObject(filename)
        file.pipe(res);
    }

    @Get('')
    async ListDocuments() {
        return await this.minioClientService.listAllDocuments()
    }

    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1024 }),
                new FileTypeValidator({ fileType: 'application/pdf' }),
            ]
        })
    ) file: BufferedFile) : Promise<string> {
        return await this.minioClientService.uploadDocument(file)
    }

    @Delete(':filename')
    async removeFile(@Param('filename') filename: string) : Promise<void> {
        await this.minioClientService.deleteDocument(filename);
    } 
}