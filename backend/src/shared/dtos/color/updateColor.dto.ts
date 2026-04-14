import { PartialType } from "@nestjs/mapped-types";
import { AddColorDto } from "./addColor.dto";

export class UpdateColorDto extends PartialType(AddColorDto) { }