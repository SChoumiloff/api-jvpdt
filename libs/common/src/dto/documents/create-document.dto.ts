import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, Max, MaxLength, MinLength } from "class-validator";

export class CreateDocumentDto {

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    @MinLength(5)
    documentName: string;

    @IsBoolean()
    @IsOptional()
    isActiveDoc?: boolean;

    @IsNotEmpty()
    @IsString()
    @MaxLength(600)
    @MinLength(100)
    documentDescription: string;

    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(3)
    @ArrayMaxSize(15)
    keyWords: string[];
}