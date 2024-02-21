import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsString, Max, MaxLength, MinLength } from "class-validator";

export class CreateDocumentDto {

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    @MinLength(15)
    documenName: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(600)
    @MinLength(150)
    documentDescription: string;

    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(3)
    @ArrayMaxSize(15)
    keyWords: string[];
}