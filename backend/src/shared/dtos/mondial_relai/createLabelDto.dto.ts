import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateLabelDto {
    @IsNotEmpty()
    @IsString()
    relayId!: string

    @IsOptional()
    @IsNumber()
    orderId!: number
}