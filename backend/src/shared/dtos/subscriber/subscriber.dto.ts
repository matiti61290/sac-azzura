import { IsEmail, IsNotEmpty } from 'class-validator';

export class SubscribeDto {
  @IsEmail({}, { message: "L'email fourni n'est pas valide." })
  @IsNotEmpty()
  email!: string;
}