import { PartialType } from "@nestjs/mapped-types";
import { AddPromotionDto } from "./addPromotion.dto";

export class UpdatePromotionDto extends PartialType(AddPromotionDto) {}