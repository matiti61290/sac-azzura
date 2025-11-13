import { PartialType } from "@nestjs/mapped-types";
import { AddMaterialDto } from "./addMaterial.dto";

export class UpdateMaterialDto extends PartialType(AddMaterialDto) {}