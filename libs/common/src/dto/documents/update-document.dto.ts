import { PartialType } from "@nestjs/mapped-types";
import { CreateDocumentDto } from "./create-document.dto";
import { IsBoolean } from "class-validator";

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {

}   