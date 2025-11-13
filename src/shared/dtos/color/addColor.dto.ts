import { IsNotEmpty, IsString } from "class-validator";

export class AddColorDto {
    @IsNotEmpty()
    @IsString()
    name: string
}