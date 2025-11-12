import { IsNotEmpty, IsString } from "class-validator";

export class AddMaterialDto {
    @IsNotEmpty()
    @IsString()
    name: string
}