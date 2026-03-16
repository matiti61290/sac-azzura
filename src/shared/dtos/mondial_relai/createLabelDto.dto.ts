import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateLabelDto {
    @IsNotEmpty()
    @IsString()
    relayId: string

    @IsOptional()
    @IsString()
    orderId: string
}