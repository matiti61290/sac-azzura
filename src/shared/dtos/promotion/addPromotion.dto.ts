import { IsDate, IsEnum, IsInt, IsJSON, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PromotionType } from "src/shared/enum/promotionType.enum";

export class AddPromotionDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsEnum(PromotionType)
    promotionType: PromotionType

    @IsOptional()
    @IsInt()
    percentageValue: number

    @IsOptional()
    @IsInt()
    fixedValue: number

    @IsNotEmpty()
    @IsDate()
    startdate: Date

    @IsNotEmpty()
    @IsDate()
    enddate: Date

    @IsOptional()
    @IsInt()
    minAmount: number

    @IsOptional()
    @IsJSON()
    categories: string[]
}