import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CheckPromotionCodeDto {
    @IsNotEmpty()
    @IsString()
    promotion_code!: string

    @IsNotEmpty()
    @IsInt()
    totalAmount!: number
}