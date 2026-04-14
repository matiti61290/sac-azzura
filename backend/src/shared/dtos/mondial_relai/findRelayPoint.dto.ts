import { IsNotEmpty, IsString } from "class-validator";

export class FindRelayPointDto {
    @IsNotEmpty()
    @IsString()
    zipcode!: string
}