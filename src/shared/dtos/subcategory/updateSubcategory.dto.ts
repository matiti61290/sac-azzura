import { PartialType } from "@nestjs/mapped-types";
import { AddSubcategoryDto } from "./addSubcategory.dto";

export class UpdateSubcategoryDto extends PartialType(AddSubcategoryDto){ }