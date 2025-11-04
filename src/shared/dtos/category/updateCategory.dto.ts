import { PartialType } from "@nestjs/mapped-types";
import { AddCategoryDto } from "./addCategory.dto";

export class UpdateCategoryDto extends PartialType(AddCategoryDto) { }