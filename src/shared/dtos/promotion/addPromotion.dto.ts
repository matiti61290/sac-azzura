import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsJSON, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PromotionType } from "../../enum/promotionType.enum";


export class AddPromotionDto {
    @IsNotEmpty()
    @IsString()
    name!: string

    @IsNotEmpty()
    @IsEnum(PromotionType)
    promotionType!: PromotionType

    @IsOptional()
    @IsInt()
    percentageValue!: number

    @IsOptional()
    @IsInt()
    fixedValue!: number

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    startdate!: Date

    @IsNotEmpty()
    @Type(()=> Date)
    @IsDate()
    enddate!: Date

    @IsOptional()
    @IsInt()
    minAmount!: number

    @IsOptional()
    @IsJSON()
    categories!: string[]
}